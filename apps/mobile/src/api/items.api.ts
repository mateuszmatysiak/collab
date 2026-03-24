import type { ListItem } from "@collab-list/shared/types";
import type {
	CreateItemRequest,
	ReorderItemsRequest,
	UpdateItemRequest,
} from "@collab-list/shared/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { queryKeys } from "./queryKeys";

export function fetchItems(listId: string) {
	return apiClient
		.get<{ items: ListItem[] }>(`/api/lists/${listId}/items`, {
			params: { includeDeleted: "true" },
		})
		.then((res) => res.data.items);
}

export const useItems = (listId: string) => {
	return useQuery<ListItem[]>({
		queryKey: queryKeys.lists.items(listId),
		queryFn: () => fetchItems(listId),
		placeholderData: [],
	});
};

export const useCreateItem = (listId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateItemRequest) =>
			apiClient
				.post<{ item: ListItem }>(`/api/lists/${listId}/items`, data)
				.then((res) => res.data.item),
		onSuccess: (newItem) => {
			queryClient.setQueryData<ListItem[]>(
				queryKeys.lists.items(listId),
				(oldItems = []) => [...oldItems, newItem],
			);
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.items(listId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.all,
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.detail(listId),
			});
		},
	});
};

export const useUpdateItem = (listId: string, itemId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateItemRequest) =>
			apiClient
				.patch<{ item: ListItem }>(`/api/lists/${listId}/items/${itemId}`, data)
				.then((res) => res.data.item),
		onMutate: async (data) => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.lists.items(listId),
			});

			const previousItems = queryClient.getQueryData<ListItem[]>(
				queryKeys.lists.items(listId),
			);

			const { is_completed, ...restData } = data;
			const optimisticData: Partial<ListItem> = {
				...restData,
				...(is_completed !== undefined ? { isCompleted: is_completed } : {}),
			};

			queryClient.setQueryData<ListItem[]>(
				queryKeys.lists.items(listId),
				(oldItems = []) =>
					oldItems.map((item) =>
						item.id === itemId ? { ...item, ...optimisticData } : item,
					),
			);

			return { previousItems };
		},
		onSuccess: (updatedItem) => {
			queryClient.setQueryData<ListItem[]>(
				queryKeys.lists.items(listId),
				(oldItems = []) =>
					oldItems.map((item) =>
						item.id === itemId ? { ...item, ...updatedItem } : item,
					),
			);
		},
		onError: (_err, _variables, context) => {
			if (context?.previousItems) {
				queryClient.setQueryData(
					queryKeys.lists.items(listId),
					context.previousItems,
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.all,
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.detail(listId),
			});
		},
	});
};

export const useDeleteItem = (listId: string, itemId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () =>
			apiClient
				.delete(`/api/lists/${listId}/items/${itemId}`)
				.then((res) => res.data),
		onMutate: async () => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.lists.items(listId),
			});

			const previousItems = queryClient.getQueryData<ListItem[]>(
				queryKeys.lists.items(listId),
			);

			queryClient.setQueryData<ListItem[]>(
				queryKeys.lists.items(listId),
				(oldItems = []) =>
					oldItems.map((item) =>
						item.id === itemId ? { ...item, deletedAt: new Date() } : item,
					),
			);

			return { previousItems };
		},
		onError: (_err, _variables, context) => {
			if (context?.previousItems) {
				queryClient.setQueryData(
					queryKeys.lists.items(listId),
					context.previousItems,
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.items(listId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.all,
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.detail(listId),
			});
		},
	});
};

export const useResetAllItems = (listId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () =>
			apiClient.put(`/api/lists/${listId}/items/reset`).then((res) => res.data),
		onMutate: async () => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.lists.items(listId),
			});

			const previousItems = queryClient.getQueryData<ListItem[]>(
				queryKeys.lists.items(listId),
			);

			queryClient.setQueryData<ListItem[]>(
				queryKeys.lists.items(listId),
				(oldItems = []) =>
					oldItems.map((item) =>
						item.deletedAt ? item : { ...item, isCompleted: false },
					),
			);

			return { previousItems };
		},
		onError: (_err, _variables, context) => {
			if (context?.previousItems) {
				queryClient.setQueryData(
					queryKeys.lists.items(listId),
					context.previousItems,
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.items(listId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.all,
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.detail(listId),
			});
		},
	});
};

export const useDeleteCompletedItems = (listId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () =>
			apiClient
				.delete(`/api/lists/${listId}/items/completed`)
				.then((res) => res.data),
		onMutate: async () => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.lists.items(listId),
			});

			const previousItems = queryClient.getQueryData<ListItem[]>(
				queryKeys.lists.items(listId),
			);

			queryClient.setQueryData<ListItem[]>(
				queryKeys.lists.items(listId),
				(oldItems = []) =>
					oldItems.map((item) =>
						item.isCompleted && !item.deletedAt
							? { ...item, deletedAt: new Date() }
							: item,
					),
			);

			return { previousItems };
		},
		onError: (_err, _variables, context) => {
			if (context?.previousItems) {
				queryClient.setQueryData(
					queryKeys.lists.items(listId),
					context.previousItems,
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.items(listId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.all,
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.detail(listId),
			});
		},
	});
};

export const useReorderItems = (listId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: ReorderItemsRequest) =>
			apiClient
				.put(`/api/lists/${listId}/items/reorder`, data)
				.then((res) => res.data),
		onMutate: async ({ itemIds }) => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.lists.items(listId),
			});

			const previousItems = queryClient.getQueryData<ListItem[]>(
				queryKeys.lists.items(listId),
			);

			if (previousItems) {
				const itemsMap = new Map(previousItems.map((item) => [item.id, item]));
				const reorderedItems = itemIds
					.map((id, index) => {
						const item = itemsMap.get(id);
						return item ? { ...item, position: index } : null;
					})
					.filter((item): item is ListItem => item !== null);

				const deletedItems = previousItems.filter((item) => item.deletedAt);
				queryClient.setQueryData<ListItem[]>(queryKeys.lists.items(listId), [
					...reorderedItems,
					...deletedItems,
				]);
			}

			return { previousItems };
		},
		onError: (_err, _variables, context) => {
			if (context?.previousItems) {
				queryClient.setQueryData(
					queryKeys.lists.items(listId),
					context.previousItems,
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.items(listId),
			});
		},
	});
};

export const useRestoreItem = (listId: string, itemId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () =>
			apiClient
				.put(`/api/lists/${listId}/items/${itemId}/restore`)
				.then((res) => res.data),
		onMutate: async () => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.lists.items(listId),
			});

			const previousItems = queryClient.getQueryData<ListItem[]>(
				queryKeys.lists.items(listId),
			);

			queryClient.setQueryData<ListItem[]>(
				queryKeys.lists.items(listId),
				(oldItems = []) =>
					oldItems.map((item) =>
						item.id === itemId
							? { ...item, deletedAt: null, isCompleted: false }
							: item,
					),
			);

			return { previousItems };
		},
		onError: (_err, _variables, context) => {
			if (context?.previousItems) {
				queryClient.setQueryData(
					queryKeys.lists.items(listId),
					context.previousItems,
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.items(listId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.all,
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.detail(listId),
			});
		},
	});
};

export const usePermanentlyDeleteItem = (listId: string, itemId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () =>
			apiClient
				.delete(`/api/lists/${listId}/items/${itemId}/permanent`)
				.then((res) => res.data),
		onMutate: async () => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.lists.items(listId),
			});

			const previousItems = queryClient.getQueryData<ListItem[]>(
				queryKeys.lists.items(listId),
			);

			queryClient.setQueryData<ListItem[]>(
				queryKeys.lists.items(listId),
				(oldItems = []) => oldItems.filter((item) => item.id !== itemId),
			);

			return { previousItems };
		},
		onError: (_err, _variables, context) => {
			if (context?.previousItems) {
				queryClient.setQueryData(
					queryKeys.lists.items(listId),
					context.previousItems,
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.items(listId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.all,
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.detail(listId),
			});
		},
	});
};

export const useRestoreAllDeleted = (listId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () =>
			apiClient
				.put(`/api/lists/${listId}/items/restore-all`)
				.then((res) => res.data),
		onMutate: async () => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.lists.items(listId),
			});

			const previousItems = queryClient.getQueryData<ListItem[]>(
				queryKeys.lists.items(listId),
			);

			queryClient.setQueryData<ListItem[]>(
				queryKeys.lists.items(listId),
				(oldItems = []) =>
					oldItems.map((item) =>
						item.deletedAt
							? { ...item, deletedAt: null, isCompleted: false }
							: item,
					),
			);

			return { previousItems };
		},
		onError: (_err, _variables, context) => {
			if (context?.previousItems) {
				queryClient.setQueryData(
					queryKeys.lists.items(listId),
					context.previousItems,
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.items(listId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.all,
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.detail(listId),
			});
		},
	});
};

export const usePermanentlyDeleteAllDeleted = (listId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () =>
			apiClient
				.delete(`/api/lists/${listId}/items/deleted`)
				.then((res) => res.data),
		onMutate: async () => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.lists.items(listId),
			});

			const previousItems = queryClient.getQueryData<ListItem[]>(
				queryKeys.lists.items(listId),
			);

			queryClient.setQueryData<ListItem[]>(
				queryKeys.lists.items(listId),
				(oldItems = []) => oldItems.filter((item) => !item.deletedAt),
			);

			return { previousItems };
		},
		onError: (_err, _variables, context) => {
			if (context?.previousItems) {
				queryClient.setQueryData(
					queryKeys.lists.items(listId),
					context.previousItems,
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.items(listId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.all,
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.detail(listId),
			});
		},
	});
};
