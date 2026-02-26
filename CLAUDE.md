# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Collaborative list management application built as a pnpm monorepo. Users can create shared lists, add items with categories, and collaborate in real-time. Architecture consists of a Hono REST API backend with PostgreSQL/Drizzle ORM, an Expo React Native mobile app, and a shared package for types and validators.

## Commands

### Development
```bash
pnpm dev:backend        # Start backend with tsx watch
pnpm dev:mobile         # Start Expo dev server
pnpm prod:backend       # Run production backend
pnpm prod:mobile        # Run production mobile
```

### Database
```bash
pnpm db:generate        # Generate migrations from schema
pnpm db:migrate         # Apply migrations
pnpm db:seed            # Seed database
pnpm db:studio          # Open Drizzle Studio
```

### Mobile Platform Commands
```bash
pnpm -C apps/mobile android                    # Dev Android
pnpm -C apps/mobile ios                        # Dev iOS
pnpm -C apps/mobile build:android:preview      # Local Android build
```

### Code Quality
```bash
pnpm typecheck          # Type-check all packages
pnpm lint              # Lint and format with BiomeJS
pnpm format            # Format only
pnpm check             # Same as lint
```

## Environment Setup

**Backend** (`apps/backend/.env.local`):
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - development or production
- `JWT_SECRET` - Generate with `openssl rand -base64 32`
- `PORT` - Optional, defaults to 3000

**Mobile** (`apps/mobile/.env.local`):
- `EXPO_PUBLIC_API_URL` - Backend API URL

## Architecture

### Monorepo Structure
- `apps/backend/` - Hono REST API
- `apps/mobile/` - Expo React Native app
- `packages/shared/` - Shared types and Zod validators

### Backend (Hono + Drizzle ORM)

**Request Flow**: Route → Validator → Middleware → Controller → Database

**Key Files**:
- `src/index.ts` - App entry, CORS config, error handling, route mounting
- `src/routes/*.routes.ts` - Route definitions with Zod validators
- `src/controllers/*.controller.ts` - Business logic
- `src/middleware/auth.ts` - JWT authentication, adds `user` to Hono context via `c.get('user')`
- `src/db/schema.ts` - Drizzle schema (snake_case columns)

**Database Schema** (key tables):
- `users` - Authentication
- `lists` - Lists with author_id
- `list_items` - Items with list_id, category_id, category_type, position, is_completed
- `list_shares` - Sharing with role enum (owner/editor)
- `user_categories` - User/list-specific categories with optional list_id
- `system_categories` - Global categories
- `refresh_tokens` - JWT refresh tokens

**Patterns**:
- Use `@collab-list/shared` validators with `@hono/zod-validator`
- Drizzle relational queries: `db.query.[table].findMany({ with: { ... } })`
- Error responses: `{ error: { message, code } }`
- Custom AppError class for structured errors

**Config**:
- `drizzle.config.ts` loads `.env.local` with override
- Migrations output to `drizzle/` directory

### Mobile (Expo + React Native)

**Provider Hierarchy** (`app/_layout.tsx`):
```
ErrorBoundary → EnvGuard → SafeAreaProvider → QueryClientProvider →
ThemeProvider → AuthProvider → Slot + PortalHost
```

**Routing Structure** (Expo Router):
- `app/(auth)/` - login.tsx, register.tsx
- `app/(tabs)/` - Bottom tab navigation
  - `lists/index.tsx` - All lists
  - `lists/[id].tsx` - List detail
  - `categories.tsx` - Category management
  - `profile.tsx` - User profile

**State Management**:
- Auth: `contexts/auth.context.tsx` - Tokens in SecureStore, provides `useAuth()`
- Theme: `contexts/theme.context.tsx` - Light mode
- Server State: React Query with optimistic updates

**API Layer** (`src/api/`):
- `client.ts` - Axios instance with auth interceptor
- `*.api.ts` - Resource-specific API functions (auth, lists, items, categories, shares, serverHealth)
- `queryKeys.ts` - Query key factory

**UI Components**:
- `components/ui/` - React Native Reusables (shadcn/ui for RN)
- `components/lists/` - Feature components organized by page

**Styling**: NativeWind v4 (Tailwind CSS for React Native)

**Auth Flow**:
1. Login returns access token (JWT) + refresh token
2. Tokens stored in SecureStore
3. Axios interceptor adds `Authorization: Bearer <token>`
4. Backend middleware verifies JWT
5. On 401, mobile auto-refreshes token

### Shared Package

**Exports**:
- `@collab-list/shared/types` - TypeScript interfaces
- `@collab-list/shared/validators` - Zod schemas

Used by both backend (validation) and mobile (types + client-side validation).

## Code Style

### TypeScript
- Strict mode enabled
- Use interfaces over types
- No enums (use maps/literals)
- Descriptive names with auxiliary verbs (isLoading, hasError)

### Formatting (BiomeJS)
- Tabs for indentation
- Double quotes
- Configured in `biome.json`

### Frontend Rules (from `.cursor/rules/frontend.mdc`)
- Functional and declarative patterns, no classes
- Component props: `function Component(props: Props)` then destructure
- Use `function` keyword for pure functions
- Directories: lowercase-with-dashes
- Components: UpperCase.tsx
- Named exports preferred

### React Native Rules (from `.cursor/rules/react-native.mdc`)
- Wrap with `SafeAreaProvider` globally, `SafeAreaView` for screens
- Use Expo Router for navigation with dynamic routes
- React Query for data fetching with retry/staleTime config
- Minimize useState/useEffect, prefer context/reducers
- Early returns for error handling
- Use `<View>` not `<div>`, `<Text>` not `<span>`, `<Pressable>` not `<button>`

### React Native Reusables Rules (from `.cursor/rules/react-native-reusables.mdc`)
- Import from `@/components/ui`
- No CSS cascade - style each `<Text>` directly
- Add components via: `npx @react-native-reusables/cli@latest add <component>`
- Requires PortalHost setup for modals/dialogs
- Available components: Alert Dialog, Avatar, Badge, Button, Card, Checkbox, Dialog, Input, Label, Select, Switch, Tabs, Text, Textarea, Toast, etc.

### Drizzle ORM Rules (from `.cursor/rules/drizzle-orm.mdc`)
- Use `pgTable` from `drizzle-orm/pg-core`
- Schema in snake_case, use column aliases if needed
- Config: `drizzle.config.ts` with dialect: "postgresql"
- Prefer relational queries: `.query.[table].findMany({ with: { ... } })`
- Use sql templates for complex expressions
- Optimize with partial selects: `.select({ field1, field2 })`
- Join operations: leftJoin, rightJoin, innerJoin, fullJoin
- Filters: eq, lt, gt, and, or from drizzle-orm

## Important Patterns

### Backend Error Handling
Use AppError for expected errors:
```typescript
throw new AppError("User not found", 404, "USER_NOT_FOUND");
```
Global error handler in `index.ts` serializes to JSON response.

### Mobile Data Fetching
Configure React Query in `app/_layout.tsx`:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: QUERY_RETRY_COUNT, staleTime: QUERY_STALE_TIME_MS }
  }
});
```

### Shared Validation
Define once in `packages/shared/src/validators/`, use in both backend (request validation) and mobile (form validation with react-hook-form + @hookform/resolvers).

### Category System
Items can have:
- `category_type: "user"` → `category_id` references `user_categories`
- `category_type: "local"` → `category_id` references `system_categories`
- Categories in `user_categories` can be global (list_id = null) or list-specific (list_id set)

## Package Manager

- Uses pnpm 9.15.0 with workspace protocol (`workspace:*`)
- Node 22.16.0 required
- Workspace defined in root `package.json`
