import type { CategoryType } from "@collab-list/shared/types";
import { and, eq, inArray, isNotNull, isNull, max } from "drizzle-orm";
import { db } from "../db/index";
import { listItems, userCategories } from "../db/schema";
import {
	ForbiddenError,
	NotFoundError,
	ValidationError,
} from "../utils/errors";
import { validateCategoryForList } from "./categories.service";
import { checkListAccess } from "./lists.service";

export async function getItems(
	listId: string,
	userId: string,
	includeDeleted = false,
) {
	const access = await checkListAccess(listId, userId);

	if (!access) {
		throw new NotFoundError("Nie znaleziono listy");
	}

	const whereCondition = includeDeleted
		? eq(listItems.listId, listId)
		: and(eq(listItems.listId, listId), isNull(listItems.deletedAt));

	const items = await db
		.select({
			id: listItems.id,
			listId: listItems.listId,
			title: listItems.title,
			description: listItems.description,
			isCompleted: listItems.isCompleted,
			categoryId: listItems.categoryId,
			categoryType: listItems.categoryType,
			categoryIcon: userCategories.icon,
			categoryName: userCategories.name,
			position: listItems.position,
			deletedAt: listItems.deletedAt,
			createdAt: listItems.createdAt,
		})
		.from(listItems)
		.leftJoin(userCategories, eq(listItems.categoryId, userCategories.id))
		.where(whereCondition)
		.orderBy(listItems.position);

	return items.map((item) => ({
		id: item.id,
		listId: item.listId,
		title: item.title,
		description: item.description,
		isCompleted: item.isCompleted,
		categoryId: item.categoryId,
		categoryType: item.categoryType,
		categoryIcon: item.categoryIcon ?? null,
		categoryName: item.categoryName ?? null,
		position: item.position,
		deletedAt: item.deletedAt,
		createdAt: item.createdAt,
	}));
}

export async function createItem(
	listId: string,
	userId: string,
	title: string,
	description?: string,
	categoryId?: string | null,
	categoryType?: CategoryType | null,
) {
	const access = await checkListAccess(listId, userId);

	if (!access) {
		throw new NotFoundError("Nie znaleziono listy");
	}

	if (access !== "owner" && access !== "editor") {
		throw new ForbiddenError(
			"Nie masz uprawnień do dodawania elementów do tej listy",
		);
	}

	if (categoryId && categoryType) {
		const isValid = await validateCategoryForList(
			categoryId,
			categoryType,
			listId,
		);
		if (!isValid) {
			throw new ValidationError("Nieprawidłowa kategoria dla tej listy");
		}
	}

	const [maxPositionResult] = await db
		.select({ maxPosition: max(listItems.position) })
		.from(listItems)
		.where(and(eq(listItems.listId, listId), isNull(listItems.deletedAt)));

	const nextPosition = (maxPositionResult?.maxPosition ?? -1) + 1;

	const [item] = await db
		.insert(listItems)
		.values({
			listId,
			title,
			description,
			isCompleted: false,
			categoryId: categoryId || null,
			categoryType: categoryId && categoryType ? categoryType : null,
			position: nextPosition,
		})
		.returning();

	if (!item) {
		throw new Error("Nie udało się utworzyć elementu listy");
	}

	const [itemWithCategory] = await db
		.select({
			id: listItems.id,
			listId: listItems.listId,
			title: listItems.title,
			description: listItems.description,
			isCompleted: listItems.isCompleted,
			categoryId: listItems.categoryId,
			categoryType: listItems.categoryType,
			categoryIcon: userCategories.icon,
			categoryName: userCategories.name,
			position: listItems.position,
			deletedAt: listItems.deletedAt,
			createdAt: listItems.createdAt,
		})
		.from(listItems)
		.leftJoin(userCategories, eq(listItems.categoryId, userCategories.id))
		.where(eq(listItems.id, item.id))
		.limit(1);

	if (!itemWithCategory) {
		throw new NotFoundError("Nie znaleziono utworzonego elementu");
	}

	return {
		id: itemWithCategory.id,
		listId: itemWithCategory.listId,
		title: itemWithCategory.title,
		description: itemWithCategory.description,
		isCompleted: itemWithCategory.isCompleted,
		categoryId: itemWithCategory.categoryId,
		categoryType: itemWithCategory.categoryType,
		categoryIcon: itemWithCategory.categoryIcon ?? null,
		categoryName: itemWithCategory.categoryName ?? null,
		position: itemWithCategory.position,
		deletedAt: itemWithCategory.deletedAt,
		createdAt: itemWithCategory.createdAt,
	};
}

export async function updateItem(
	itemId: string,
	listId: string,
	userId: string,
	data: {
		title?: string;
		description?: string;
		is_completed?: boolean;
		categoryId?: string | null;
		categoryType?: CategoryType | null;
	},
) {
	const access = await checkListAccess(listId, userId);

	if (!access) {
		throw new NotFoundError("Nie znaleziono listy");
	}

	if (access !== "owner" && access !== "editor") {
		throw new ForbiddenError(
			"Nie masz uprawnień do edycji elementów tej listy",
		);
	}

	const [item] = await db
		.select()
		.from(listItems)
		.where(eq(listItems.id, itemId))
		.limit(1);

	if (!item) {
		throw new NotFoundError("Nie znaleziono elementu listy");
	}

	if (item.listId !== listId) {
		throw new NotFoundError("Element nie należy do tej listy");
	}

	if (data.categoryId !== undefined && data.categoryId !== null) {
		const categoryType = data.categoryType ?? item.categoryType;
		if (categoryType) {
			const isValid = await validateCategoryForList(
				data.categoryId,
				categoryType,
				listId,
			);
			if (!isValid) {
				throw new ValidationError("Nieprawidłowa kategoria dla tej listy");
			}
		}
	}

	const updateData: {
		title?: string;
		description?: string;
		isCompleted?: boolean;
		categoryId?: string | null;
		categoryType?: CategoryType | null;
	} = {};

	if (data.title !== undefined) {
		updateData.title = data.title;
	}

	if (data.description !== undefined) {
		updateData.description = data.description;
	}

	if (data.is_completed !== undefined) {
		updateData.isCompleted = data.is_completed;
	}

	if (data.categoryId !== undefined) {
		updateData.categoryId = data.categoryId || null;
		if (!data.categoryId) {
			updateData.categoryType = null;
		} else if (data.categoryType !== undefined) {
			updateData.categoryType = data.categoryType;
		}
	}

	await db.update(listItems).set(updateData).where(eq(listItems.id, itemId));

	const [itemWithCategory] = await db
		.select({
			id: listItems.id,
			listId: listItems.listId,
			title: listItems.title,
			description: listItems.description,
			isCompleted: listItems.isCompleted,
			categoryId: listItems.categoryId,
			categoryType: listItems.categoryType,
			categoryIcon: userCategories.icon,
			categoryName: userCategories.name,
			position: listItems.position,
			deletedAt: listItems.deletedAt,
			createdAt: listItems.createdAt,
		})
		.from(listItems)
		.leftJoin(userCategories, eq(listItems.categoryId, userCategories.id))
		.where(eq(listItems.id, itemId))
		.limit(1);

	if (!itemWithCategory) {
		throw new NotFoundError("Nie znaleziono zaktualizowanego elementu");
	}

	return {
		id: itemWithCategory.id,
		listId: itemWithCategory.listId,
		title: itemWithCategory.title,
		description: itemWithCategory.description,
		isCompleted: itemWithCategory.isCompleted,
		categoryId: itemWithCategory.categoryId,
		categoryType: itemWithCategory.categoryType,
		categoryIcon: itemWithCategory.categoryIcon ?? null,
		categoryName: itemWithCategory.categoryName ?? null,
		position: itemWithCategory.position,
		deletedAt: itemWithCategory.deletedAt,
		createdAt: itemWithCategory.createdAt,
	};
}

export async function deleteItem(
	itemId: string,
	listId: string,
	userId: string,
) {
	const access = await checkListAccess(listId, userId);

	if (!access) {
		throw new NotFoundError("Nie znaleziono listy");
	}

	if (access !== "owner" && access !== "editor") {
		throw new ForbiddenError(
			"Nie masz uprawnień do usuwania elementów z tej listy",
		);
	}

	const [item] = await db
		.select()
		.from(listItems)
		.where(eq(listItems.id, itemId))
		.limit(1);

	if (!item) {
		throw new NotFoundError("Nie znaleziono elementu listy");
	}

	if (item.listId !== listId) {
		throw new NotFoundError("Element nie należy do tej listy");
	}

	await db
		.update(listItems)
		.set({ deletedAt: new Date() })
		.where(eq(listItems.id, itemId));
}

export async function resetAllItems(listId: string, userId: string) {
	const access = await checkListAccess(listId, userId);

	if (!access) {
		throw new NotFoundError("Nie znaleziono listy");
	}

	if (access !== "owner" && access !== "editor") {
		throw new ForbiddenError(
			"Nie masz uprawnień do edycji elementów tej listy",
		);
	}

	await db
		.update(listItems)
		.set({ isCompleted: false })
		.where(
			and(
				eq(listItems.listId, listId),
				eq(listItems.isCompleted, true),
				isNull(listItems.deletedAt),
			),
		);
}

export async function deleteCompletedItems(listId: string, userId: string) {
	const access = await checkListAccess(listId, userId);

	if (!access) {
		throw new NotFoundError("Nie znaleziono listy");
	}

	if (access !== "owner" && access !== "editor") {
		throw new ForbiddenError(
			"Nie masz uprawnień do usuwania elementów z tej listy",
		);
	}

	await db
		.update(listItems)
		.set({ deletedAt: new Date() })
		.where(
			and(
				eq(listItems.listId, listId),
				eq(listItems.isCompleted, true),
				isNull(listItems.deletedAt),
			),
		);
}

export async function reorderItems(
	listId: string,
	userId: string,
	itemIds: string[],
) {
	const access = await checkListAccess(listId, userId);

	if (!access) {
		throw new NotFoundError("Nie znaleziono listy");
	}

	if (access !== "owner" && access !== "editor") {
		throw new ForbiddenError(
			"Nie masz uprawnień do zmiany kolejności elementów tej listy",
		);
	}

	const existingItems = await db
		.select({ id: listItems.id })
		.from(listItems)
		.where(
			and(
				eq(listItems.listId, listId),
				inArray(listItems.id, itemIds),
				isNull(listItems.deletedAt),
			),
		);

	const existingIds = new Set(existingItems.map((item) => item.id));
	const invalidIds = itemIds.filter((id) => !existingIds.has(id));

	if (invalidIds.length > 0) {
		throw new NotFoundError("Niektóre elementy nie należą do tej listy");
	}

	await Promise.all(
		itemIds.map((itemId, index) =>
			db
				.update(listItems)
				.set({ position: index })
				.where(eq(listItems.id, itemId)),
		),
	);
}

export async function restoreItem(
	itemId: string,
	listId: string,
	userId: string,
) {
	const access = await checkListAccess(listId, userId);

	if (!access) {
		throw new NotFoundError("Nie znaleziono listy");
	}

	if (access !== "owner" && access !== "editor") {
		throw new ForbiddenError(
			"Nie masz uprawnień do przywracania elementów tej listy",
		);
	}

	const [item] = await db
		.select()
		.from(listItems)
		.where(eq(listItems.id, itemId))
		.limit(1);

	if (!item) {
		throw new NotFoundError("Nie znaleziono elementu listy");
	}

	if (item.listId !== listId) {
		throw new NotFoundError("Element nie należy do tej listy");
	}

	if (!item.deletedAt) {
		throw new ValidationError("Element nie jest usunięty");
	}

	const [maxPositionResult] = await db
		.select({ maxPosition: max(listItems.position) })
		.from(listItems)
		.where(and(eq(listItems.listId, listId), isNull(listItems.deletedAt)));

	const nextPosition = (maxPositionResult?.maxPosition ?? -1) + 1;

	await db
		.update(listItems)
		.set({ deletedAt: null, isCompleted: false, position: nextPosition })
		.where(eq(listItems.id, itemId));
}

export async function permanentlyDeleteItem(
	itemId: string,
	listId: string,
	userId: string,
) {
	const access = await checkListAccess(listId, userId);

	if (!access) {
		throw new NotFoundError("Nie znaleziono listy");
	}

	if (access !== "owner" && access !== "editor") {
		throw new ForbiddenError(
			"Nie masz uprawnień do usuwania elementów z tej listy",
		);
	}

	const [item] = await db
		.select()
		.from(listItems)
		.where(eq(listItems.id, itemId))
		.limit(1);

	if (!item) {
		throw new NotFoundError("Nie znaleziono elementu listy");
	}

	if (item.listId !== listId) {
		throw new NotFoundError("Element nie należy do tej listy");
	}

	if (!item.deletedAt) {
		throw new ValidationError(
			"Element nie jest usunięty — najpierw przenieś do kosza",
		);
	}

	await db.delete(listItems).where(eq(listItems.id, itemId));
}

export async function restoreAllDeleted(listId: string, userId: string) {
	const access = await checkListAccess(listId, userId);

	if (!access) {
		throw new NotFoundError("Nie znaleziono listy");
	}

	if (access !== "owner" && access !== "editor") {
		throw new ForbiddenError(
			"Nie masz uprawnień do przywracania elementów tej listy",
		);
	}

	const [maxPositionResult] = await db
		.select({ maxPosition: max(listItems.position) })
		.from(listItems)
		.where(and(eq(listItems.listId, listId), isNull(listItems.deletedAt)));

	let nextPosition = (maxPositionResult?.maxPosition ?? -1) + 1;

	const deletedItemsList = await db
		.select({ id: listItems.id })
		.from(listItems)
		.where(and(eq(listItems.listId, listId), isNotNull(listItems.deletedAt)));

	await Promise.all(
		deletedItemsList.map((item) => {
			const position = nextPosition++;
			return db
				.update(listItems)
				.set({ deletedAt: null, isCompleted: false, position })
				.where(eq(listItems.id, item.id));
		}),
	);
}

export async function permanentlyDeleteAllDeleted(
	listId: string,
	userId: string,
) {
	const access = await checkListAccess(listId, userId);

	if (!access) {
		throw new NotFoundError("Nie znaleziono listy");
	}

	if (access !== "owner" && access !== "editor") {
		throw new ForbiddenError(
			"Nie masz uprawnień do usuwania elementów z tej listy",
		);
	}

	await db
		.delete(listItems)
		.where(and(eq(listItems.listId, listId), isNotNull(listItems.deletedAt)));
}
