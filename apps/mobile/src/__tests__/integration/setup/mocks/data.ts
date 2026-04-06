import type {
	ListCategory,
	ListItem,
	ListWithDetails,
	SharesAuthor,
	ShareWithUser,
} from "@collab-list/shared/types";

let idCounter = 0;

function nextId() {
	return `test-id-${++idCounter}`;
}

export function resetIdCounter() {
	idCounter = 0;
}

export const TEST_USER = {
	id: "user-1",
	name: "Test User",
	login: "testuser",
};

export const OTHER_USER = {
	id: "user-2",
	name: "Other User",
	login: "otheruser",
};

export function createList(
	overrides?: Partial<ListWithDetails>,
): ListWithDetails {
	return {
		id: nextId(),
		name: "Test List",
		authorId: TEST_USER.id,
		createdAt: new Date("2024-01-01"),
		itemsCount: 0,
		completedCount: 0,
		sharesCount: 0,
		shares: [],
		role: "owner",
		...overrides,
	};
}

export function createItem(
	listId: string,
	overrides?: Partial<ListItem>,
): ListItem {
	const id = nextId();
	return {
		id,
		listId,
		title: `Item ${id}`,
		description: null,
		isCompleted: false,
		categoryId: null,
		categoryType: null,
		categoryIcon: null,
		categoryName: null,
		position: 0,
		deletedAt: null,
		createdAt: new Date("2024-01-01"),
		...overrides,
	};
}

export function createShare(overrides?: Partial<ShareWithUser>): ShareWithUser {
	return {
		id: nextId(),
		userId: OTHER_USER.id,
		userName: OTHER_USER.name,
		userLogin: OTHER_USER.login,
		role: "editor",
		createdAt: new Date("2024-01-01"),
		...overrides,
	};
}

export function createAuthor(overrides?: Partial<SharesAuthor>): SharesAuthor {
	return {
		id: TEST_USER.id,
		name: TEST_USER.name,
		login: TEST_USER.login,
		...overrides,
	};
}

export function createCategory(
	overrides?: Partial<ListCategory>,
): ListCategory {
	return {
		id: nextId(),
		name: "Test Category",
		icon: "ShoppingCart",
		type: "user",
		isOwner: true,
		hasInDictionary: false,
		authorName: undefined,
		...overrides,
	};
}
