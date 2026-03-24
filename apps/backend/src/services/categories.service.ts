import type { CategoryType } from "@collab-list/shared/types";
import { and, eq, isNull, or } from "drizzle-orm";
import { db } from "../db/index";
import { lists, userCategories, users } from "../db/schema";
import { ConflictError, ForbiddenError, NotFoundError } from "../utils/errors";
import { checkListAccess } from "./lists.service";

export async function getUserCategories(userId: string) {
	const categories = await db
		.select({
			id: userCategories.id,
			name: userCategories.name,
			icon: userCategories.icon,
			createdAt: userCategories.createdAt,
		})
		.from(userCategories)
		.where(
			and(eq(userCategories.userId, userId), isNull(userCategories.listId)),
		)
		.orderBy(userCategories.createdAt);

	return categories;
}

export async function getCategoriesForList(listId: string, userId: string) {
	const access = await checkListAccess(listId, userId);
	if (!access) {
		throw new NotFoundError("Nie znaleziono listy");
	}

	const [list] = await db
		.select()
		.from(lists)
		.where(eq(lists.id, listId))
		.limit(1);

	if (!list) {
		throw new NotFoundError("Nie znaleziono listy");
	}

	const categories = await db
		.select({
			id: userCategories.id,
			userId: userCategories.userId,
			name: userCategories.name,
			icon: userCategories.icon,
			listId: userCategories.listId,
			createdAt: userCategories.createdAt,
			authorName: users.name,
		})
		.from(userCategories)
		.leftJoin(users, eq(userCategories.userId, users.id))
		.where(
			or(
				and(
					eq(userCategories.userId, list.authorId),
					isNull(userCategories.listId),
				),
				eq(userCategories.listId, listId),
			),
		)
		.orderBy(userCategories.createdAt);

	const userCategoryNames = await db
		.select({ name: userCategories.name })
		.from(userCategories)
		.where(
			and(eq(userCategories.userId, userId), isNull(userCategories.listId)),
		);

	const userCategoryNameSet = new Set(
		userCategoryNames.map((cat) => cat.name.trim().toLowerCase()),
	);

	return categories.map((cat) => {
		const normalizedName = cat.name.trim().toLowerCase();
		return {
			id: cat.id,
			name: cat.name,
			icon: cat.icon,
			type: cat.listId ? "local" : "user",
			isOwner: cat.userId === userId,
			hasInDictionary: userCategoryNameSet.has(normalizedName),
			authorName: cat.listId ? cat.authorName : undefined,
		};
	});
}

export async function createUserCategory(
	userId: string,
	name: string,
	icon: string,
) {
	const [existing] = await db
		.select()
		.from(userCategories)
		.where(
			and(
				eq(userCategories.userId, userId),
				eq(userCategories.name, name),
				isNull(userCategories.listId),
			),
		)
		.limit(1);

	if (existing) {
		throw new ConflictError("Kategoria o tej nazwie już istnieje");
	}

	const [category] = await db
		.insert(userCategories)
		.values({
			userId,
			name,
			icon,
			listId: null,
		})
		.returning();

	return category;
}

export async function createLocalCategory(
	listId: string,
	userId: string,
	name: string,
	icon: string,
) {
	const access = await checkListAccess(listId, userId);
	if (!access) {
		throw new NotFoundError("Nie znaleziono listy");
	}

	const [list] = await db
		.select()
		.from(lists)
		.where(eq(lists.id, listId))
		.limit(1);

	if (!list) {
		throw new NotFoundError("Nie znaleziono listy");
	}

	const isOwner = list.authorId === userId;

	if (isOwner) {
		const [existing] = await db
			.select()
			.from(userCategories)
			.where(
				and(
					eq(userCategories.userId, userId),
					eq(userCategories.name, name),
					isNull(userCategories.listId),
				),
			)
			.limit(1);

		if (existing) {
			throw new ConflictError("Kategoria o tej nazwie już istnieje");
		}

		const [category] = await db
			.insert(userCategories)
			.values({
				userId,
				name,
				icon,
				listId: null,
			})
			.returning();

		if (!category) {
			throw new Error("Nie udało się utworzyć kategorii");
		}

		return {
			id: category.id,
			name: category.name,
			icon: category.icon,
			type: "user",
			isOwner: true,
		};
	}

	const [existing] = await db
		.select()
		.from(userCategories)
		.where(
			and(eq(userCategories.listId, listId), eq(userCategories.name, name)),
		)
		.limit(1);

	if (existing) {
		throw new ConflictError(
			"Lokalna kategoria o tej nazwie już istnieje w tej liście",
		);
	}

	const [category] = await db
		.insert(userCategories)
		.values({
			userId,
			name,
			icon,
			listId,
		})
		.returning();

	if (!category) {
		throw new Error("Nie udało się utworzyć kategorii");
	}

	return {
		id: category.id,
		name: category.name,
		icon: category.icon,
		type: "local",
		isOwner: false,
	};
}

export async function updateUserCategory(
	categoryId: string,
	userId: string,
	data: { name?: string; icon?: string },
) {
	const [category] = await db
		.select()
		.from(userCategories)
		.where(
			and(
				eq(userCategories.id, categoryId),
				eq(userCategories.userId, userId),
				isNull(userCategories.listId),
			),
		)
		.limit(1);

	if (!category) {
		throw new NotFoundError("Nie znaleziono kategorii");
	}

	if (data.name && data.name !== category.name) {
		const [existing] = await db
			.select()
			.from(userCategories)
			.where(
				and(
					eq(userCategories.userId, userId),
					eq(userCategories.name, data.name),
					isNull(userCategories.listId),
				),
			)
			.limit(1);

		if (existing) {
			throw new ConflictError("Kategoria o tej nazwie już istnieje");
		}
	}

	const [updatedCategory] = await db
		.update(userCategories)
		.set({
			name: data.name ?? category.name,
			icon: data.icon ?? category.icon,
		})
		.where(eq(userCategories.id, categoryId))
		.returning();

	return updatedCategory;
}

export async function deleteUserCategory(categoryId: string, userId: string) {
	const [category] = await db
		.select()
		.from(userCategories)
		.where(
			and(
				eq(userCategories.id, categoryId),
				eq(userCategories.userId, userId),
				isNull(userCategories.listId),
			),
		)
		.limit(1);

	if (!category) {
		throw new NotFoundError("Nie znaleziono kategorii");
	}

	await db.delete(userCategories).where(eq(userCategories.id, categoryId));
}

export async function deleteLocalCategory(
	categoryId: string,
	listId: string,
	userId: string,
) {
	const access = await checkListAccess(listId, userId);
	if (!access) {
		throw new NotFoundError("Nie znaleziono listy");
	}

	const [category] = await db
		.select()
		.from(userCategories)
		.where(
			and(eq(userCategories.id, categoryId), eq(userCategories.listId, listId)),
		)
		.limit(1);

	if (!category) {
		throw new NotFoundError("Nie znaleziono kategorii lokalnej");
	}

	if (!category.listId) {
		throw new ForbiddenError(
			"Nie można usunąć kategorii globalnej z poziomu listy",
		);
	}

	const [list] = await db
		.select()
		.from(lists)
		.where(eq(lists.id, listId))
		.limit(1);

	if (!list) {
		throw new NotFoundError("Nie znaleziono listy");
	}

	if (category.userId !== userId && list.authorId !== userId) {
		throw new ForbiddenError("Nie masz uprawnień do usunięcia tej kategorii");
	}

	await db.delete(userCategories).where(eq(userCategories.id, categoryId));
}

export async function saveLocalToUser(
	localCategoryId: string,
	listId: string,
	userId: string,
) {
	const access = await checkListAccess(listId, userId);
	if (!access) {
		throw new NotFoundError("Nie znaleziono listy");
	}

	const [localCategory] = await db
		.select()
		.from(userCategories)
		.where(
			and(
				eq(userCategories.id, localCategoryId),
				eq(userCategories.listId, listId),
			),
		)
		.limit(1);

	if (!localCategory) {
		throw new NotFoundError("Nie znaleziono kategorii lokalnej");
	}

	const [existing] = await db
		.select()
		.from(userCategories)
		.where(
			and(
				eq(userCategories.userId, userId),
				eq(userCategories.name, localCategory.name),
				isNull(userCategories.listId),
			),
		)
		.limit(1);

	if (existing) {
		throw new ConflictError(
			`Masz już globalną kategorię o nazwie: ${localCategory.name}`,
		);
	}

	const [newCategory] = await db
		.insert(userCategories)
		.values({
			userId,
			name: localCategory.name,
			icon: localCategory.icon,
			listId: null,
		})
		.returning();

	return newCategory;
}

export async function validateCategoryForList(
	categoryId: string,
	categoryType: CategoryType,
	listId: string,
): Promise<boolean> {
	const [list] = await db
		.select()
		.from(lists)
		.where(eq(lists.id, listId))
		.limit(1);

	if (!list) {
		return false;
	}

	if (categoryType === "user") {
		const [category] = await db
			.select()
			.from(userCategories)
			.where(
				and(
					eq(userCategories.id, categoryId),
					eq(userCategories.userId, list.authorId),
					isNull(userCategories.listId),
				),
			)
			.limit(1);
		return category !== undefined;
	}

	if (categoryType === "local") {
		const [category] = await db
			.select()
			.from(userCategories)
			.where(
				and(
					eq(userCategories.id, categoryId),
					eq(userCategories.listId, listId),
				),
			)
			.limit(1);
		return category !== undefined;
	}

	return false;
}

export async function importLocalToOwner(
	localCategoryId: string,
	listId: string,
	userId: string,
) {
	const [list] = await db
		.select()
		.from(lists)
		.where(eq(lists.id, listId))
		.limit(1);

	if (!list) {
		throw new NotFoundError("Nie znaleziono listy");
	}

	if (list.authorId !== userId) {
		throw new ForbiddenError("Tylko autor listy może importować kategorie");
	}

	const [localCategory] = await db
		.select()
		.from(userCategories)
		.where(
			and(
				eq(userCategories.id, localCategoryId),
				eq(userCategories.listId, listId),
			),
		)
		.limit(1);

	if (!localCategory) {
		throw new NotFoundError("Nie znaleziono kategorii lokalnej");
	}

	const [existing] = await db
		.select()
		.from(userCategories)
		.where(
			and(
				eq(userCategories.userId, userId),
				eq(userCategories.name, localCategory.name),
				isNull(userCategories.listId),
			),
		)
		.limit(1);

	if (existing) {
		throw new ConflictError(
			`Masz już globalną kategorię o nazwie: ${localCategory.name}`,
		);
	}

	const [updatedCategory] = await db
		.update(userCategories)
		.set({
			userId,
			listId: null,
		})
		.where(eq(userCategories.id, localCategoryId))
		.returning();

	return updatedCategory;
}
