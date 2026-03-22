import type { CategoryType } from "./categories.types";

export interface ListItem {
	id: string;
	listId: string;
	title: string;
	description: string | null;
	isCompleted: boolean;
	categoryId: string | null;
	categoryType: CategoryType | null;
	categoryIcon: string | null;
	categoryName: string | null;
	position: number;
	deletedAt: Date | null;
	createdAt: Date;
}
