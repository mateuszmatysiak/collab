import type { ListItem } from "@collab-list/shared/types";
import type {
	CreateItemRequest,
	ReorderItemsRequest,
	UpdateItemRequest,
} from "@collab-list/shared/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { queryKeys } from "./queryKeys";

export const useItems = (listId: string) => {
	return useQuery<ListItem[]>({
		queryKey: queryKeys.lists.items(listId),
		queryFn: () =>
			apiClient
				.get<{ items: ListItem[] }>(`/api/lists/${listId}/items`)
				.then((res) => res.data.items),
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
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.all,
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

			queryClient.setQueryData<ListItem[]>(
				queryKeys.lists.items(listId),
				(oldItems = []) =>
					oldItems.map((item) =>
						item.id === itemId ? { ...item, ...data } : item,
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
					oldItems.map((item) => ({ ...item, isCompleted: false })),
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
				(oldItems = []) => oldItems.filter((item) => !item.isCompleted),
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

				queryClient.setQueryData<ListItem[]>(
					queryKeys.lists.items(listId),
					reorderedItems,
				);
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
