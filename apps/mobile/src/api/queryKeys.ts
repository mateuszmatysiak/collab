export const queryKeys = {
	lists: {
		all: ["lists"] as const,
		detail: (id: string) => ["lists", id] as const,
		items: (listId: string) => ["lists", listId, "items"] as const,
		shares: (listId: string) => ["lists", listId, "shares"] as const,
	},
	categories: {
		user: ["categories", "user"] as const,
		list: (listId: string) => ["categories", "list", listId] as const,
	},
};
