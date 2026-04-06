import type {
	Category,
	ListCategory,
	ListItem,
	ListWithDetails,
} from "@collab-list/shared/types";

let idCounter = 0;

function nextId() {
	return `test-id-${++idCounter}`;
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

export function createUserCategory(overrides?: Partial<Category>): Category {
	const id = nextId();
	return {
		id,
		name: `Category ${id}`,
		icon: "ShoppingCart",
		createdAt: new Date("2024-01-01"),
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
