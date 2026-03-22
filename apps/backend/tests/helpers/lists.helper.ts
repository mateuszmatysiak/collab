interface ListResponse {
	id: string;
	name: string;
	authorId: string;
	createdAt: string;
}

let listCounter = 0;

export function generateListName(): string {
	listCounter++;
	return `Test List ${listCounter}_${Date.now()}`;
}

export async function createList(
	request: (path: string, options?: RequestInit) => Promise<Response>,
	name?: string,
): Promise<ListResponse> {
	const listName = name ?? generateListName();

	const response = await request("/api/lists", {
		method: "POST",
		body: JSON.stringify({ name: listName }),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(
			`Failed to create list: ${response.status} - ${JSON.stringify(error)}`,
		);
	}

	const data = await response.json();
	return data.list as ListResponse;
}

export function resetListCounter() {
	listCounter = 0;
}
