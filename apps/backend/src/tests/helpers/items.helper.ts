interface ItemResponse {
	id: string;
	listId: string;
	title: string;
	description: string | null;
	isCompleted: boolean;
	position: number;
	categoryId: string | null;
	categoryType: string | null;
	deletedAt: string | null;
}

let itemCounter = 0;

function generateItemTitle(): string {
	itemCounter++;
	return `Test Item ${itemCounter}_${Date.now()}`;
}

export async function createItem(
	request: (path: string, options?: RequestInit) => Promise<Response>,
	listId: string,
	title?: string,
): Promise<ItemResponse> {
	const itemTitle = title ?? generateItemTitle();

	const response = await request(`/api/lists/${listId}/items`, {
		method: "POST",
		body: JSON.stringify({ title: itemTitle }),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(
			`Failed to create item: ${response.status} - ${JSON.stringify(error)}`,
		);
	}

	const data = (await response.json()) as { item: ItemResponse };
	return data.item;
}
