import {
	createItemSchema,
	reorderItemsSchema,
	updateItemSchema,
} from "@collab-list/shared/validators";
import type { Context } from "hono";
import { authMiddleware } from "../middleware/auth";
import {
	createItem,
	deleteCompletedItems,
	deleteItem,
	getItems,
	permanentlyDeleteAllDeleted,
	permanentlyDeleteItem,
	reorderItems,
	resetAllItems,
	restoreItem,
	updateItem,
} from "../services/items.service";
import { createJsonValidator, getValidatedJson } from "../utils/validator";

export const getItemsController = [
	authMiddleware,
	async (c: Context) => {
		const userId = c.get("userId");
		const listId = c.req.param("listId");
		const includeDeleted = c.req.query("includeDeleted") === "true";

		const items = await getItems(listId, userId, includeDeleted);

		return c.json({ items });
	},
];

export const createItemController = [
	authMiddleware,
	createJsonValidator(createItemSchema),
	async (c: Context) => {
		const userId = c.get("userId");
		const listId = c.req.param("listId");
		const { title, description, categoryId, categoryType } = getValidatedJson(
			c,
			createItemSchema,
		);

		const item = await createItem(
			listId,
			userId,
			title,
			description,
			categoryId,
			categoryType,
		);

		return c.json({ item }, 201);
	},
];

export const updateItemController = [
	authMiddleware,
	createJsonValidator(updateItemSchema),
	async (c: Context) => {
		const userId = c.get("userId");
		const listId = c.req.param("listId");
		const itemId = c.req.param("itemId");
		const data = getValidatedJson(c, updateItemSchema);

		const item = await updateItem(itemId, listId, userId, data);

		return c.json({ item });
	},
];

export const deleteItemController = [
	authMiddleware,
	async (c: Context) => {
		const userId = c.get("userId");
		const listId = c.req.param("listId");
		const itemId = c.req.param("itemId");

		await deleteItem(itemId, listId, userId);

		return c.json({ message: "Element usunięty pomyślnie" });
	},
];

export const resetAllItemsController = [
	authMiddleware,
	async (c: Context) => {
		const userId = c.get("userId");
		const listId = c.req.param("listId");

		await resetAllItems(listId, userId);

		return c.json({ message: "Wszystkie elementy zostały odznaczone" });
	},
];

export const deleteCompletedItemsController = [
	authMiddleware,
	async (c: Context) => {
		const userId = c.get("userId");
		const listId = c.req.param("listId");

		await deleteCompletedItems(listId, userId);

		return c.json({ message: "Zaznaczone elementy zostały usunięte" });
	},
];

export const reorderItemsController = [
	authMiddleware,
	createJsonValidator(reorderItemsSchema),
	async (c: Context) => {
		const userId = c.get("userId");
		const listId = c.req.param("listId");
		const { itemIds } = getValidatedJson(c, reorderItemsSchema);

		await reorderItems(listId, userId, itemIds);

		return c.json({ message: "Kolejność elementów zaktualizowana" });
	},
];

export const restoreItemController = [
	authMiddleware,
	async (c: Context) => {
		const userId = c.get("userId");
		const listId = c.req.param("listId");
		const itemId = c.req.param("itemId");

		await restoreItem(itemId, listId, userId);

		return c.json({ message: "Element przywrócony pomyślnie" });
	},
];

export const permanentlyDeleteItemController = [
	authMiddleware,
	async (c: Context) => {
		const userId = c.get("userId");
		const listId = c.req.param("listId");
		const itemId = c.req.param("itemId");

		await permanentlyDeleteItem(itemId, listId, userId);

		return c.json({ message: "Element trwale usunięty" });
	},
];

export const permanentlyDeleteAllDeletedController = [
	authMiddleware,
	async (c: Context) => {
		const userId = c.get("userId");
		const listId = c.req.param("listId");

		await permanentlyDeleteAllDeleted(listId, userId);

		return c.json({ message: "Usunięte elementy zostały trwale usunięte" });
	},
];
