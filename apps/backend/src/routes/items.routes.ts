import { Hono } from "hono";
import {
	createItemController,
	deleteCompletedItemsController,
	deleteItemController,
	getItemsController,
	permanentlyDeleteAllDeletedController,
	permanentlyDeleteItemController,
	reorderItemsController,
	resetAllItemsController,
	restoreItemController,
	updateItemController,
} from "../controllers/items.controller";

const itemsRoutes = new Hono();

itemsRoutes.get("/:listId/items", ...getItemsController);
itemsRoutes.post("/:listId/items", ...createItemController);
itemsRoutes.put("/:listId/items/reorder", ...reorderItemsController);
itemsRoutes.put("/:listId/items/reset", ...resetAllItemsController);
itemsRoutes.delete(
	"/:listId/items/completed",
	...deleteCompletedItemsController,
);
itemsRoutes.delete(
	"/:listId/items/deleted",
	...permanentlyDeleteAllDeletedController,
);
itemsRoutes.patch("/:listId/items/:itemId", ...updateItemController);
itemsRoutes.delete("/:listId/items/:itemId", ...deleteItemController);
itemsRoutes.put("/:listId/items/:itemId/restore", ...restoreItemController);
itemsRoutes.delete(
	"/:listId/items/:itemId/permanent",
	...permanentlyDeleteItemController,
);

export default itemsRoutes;
