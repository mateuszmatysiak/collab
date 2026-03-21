import {
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["owner", "editor"]);
export const categoryTypeEnum = pgEnum("category_type", ["user", "local"]);

export const users = pgTable(
	"users",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		name: varchar("name", { length: 255 }).notNull(),
		login: varchar("login", { length: 255 }).notNull().unique(),
		passwordHash: varchar("password_hash", { length: 255 }).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [index("users_login_idx").on(table.login)],
);

export const lists = pgTable(
	"lists",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		name: varchar("name", { length: 500 }).notNull(),
		authorId: uuid("author_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [index("lists_author_id_idx").on(table.authorId)],
);

export const systemCategories = pgTable("system_categories", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: varchar("name", { length: 255 }).notNull(),
	icon: varchar("icon", { length: 100 }).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userCategories = pgTable(
	"user_categories",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		name: varchar("name", { length: 255 }).notNull(),
		icon: varchar("icon", { length: 100 }).notNull(),
		listId: uuid("list_id").references(() => lists.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("user_categories_user_id_idx").on(table.userId),
		index("user_categories_list_id_idx").on(table.listId),
		index("user_categories_user_list_idx").on(table.userId, table.listId),
	],
);

export const listItems = pgTable(
	"list_items",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		listId: uuid("list_id")
			.notNull()
			.references(() => lists.id, { onDelete: "cascade" }),
		title: varchar("title", { length: 1000 }).notNull(),
		description: varchar("description", { length: 2000 }),
		isCompleted: boolean("is_completed").default(false).notNull(),
		categoryId: uuid("category_id").references(() => userCategories.id, {
			onDelete: "set null",
		}),
		categoryType: categoryTypeEnum("category_type"),
		position: integer("position").default(0).notNull(),
		deletedAt: timestamp("deleted_at"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("list_items_list_id_idx").on(table.listId),
		index("list_items_category_id_idx").on(table.categoryId),
		index("list_items_category_type_idx").on(
			table.categoryId,
			table.categoryType,
		),
		index("list_items_list_id_deleted_at_idx").on(
			table.listId,
			table.deletedAt,
		),
	],
);

export const listShares = pgTable(
	"list_shares",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		listId: uuid("list_id")
			.notNull()
			.references(() => lists.id, { onDelete: "cascade" }),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		role: roleEnum("role").default("editor").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("list_shares_list_user_idx").on(table.listId, table.userId),
		unique("list_shares_unique_list_user_idx").on(table.listId, table.userId),
	],
);

export const refreshTokens = pgTable(
	"refresh_tokens",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		token: varchar("token", { length: 500 }).notNull().unique(),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("refresh_tokens_user_id_idx").on(table.userId),
		index("refresh_tokens_token_idx").on(table.token),
	],
);
