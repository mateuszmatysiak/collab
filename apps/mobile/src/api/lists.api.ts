import type { ListWithDetails } from "@collab-list/shared/types";
import type {
	CreateListRequest,
	UpdateListRequest,
} from "@collab-list/shared/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { queryKeys } from "./queryKeys";

export const useLists = () => {
	return useQuery<ListWithDetails[]>({
		queryKey: queryKeys.lists.all,
		queryFn: () =>
			apiClient
				.get<{ lists: ListWithDetails[] }>("/api/lists")
				.then((res) => res.data.lists),
	});
};

export const useList = (id: string | undefined) => {
	const queryClient = useQueryClient();

	return useQuery<ListWithDetails>({
		queryKey: queryKeys.lists.detail(id ?? ""),
		queryFn: () =>
			apiClient
				.get<{ list: ListWithDetails }>(`/api/lists/${id}`)
				.then((res) => res.data.list),
		enabled: !!id,
		placeholderData: () => {
			const lists = queryClient.getQueryData<ListWithDetails[]>(
				queryKeys.lists.all,
			);
			return lists?.find((list) => list.id === id);
		},
	});
};

export const useCreateList = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateListRequest) =>
			apiClient
				.post<{ list: ListWithDetails }>("/api/lists", data)
				.then((res) => res.data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.lists.all });
		},
	});
};

export const useUpdateList = (id: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateListRequest) =>
			apiClient.patch(`/api/lists/${id}`, data).then((res) => res.data),
		onMutate: async (variables) => {
			await queryClient.cancelQueries({ queryKey: queryKeys.lists.all });
			await queryClient.cancelQueries({
				queryKey: queryKeys.lists.detail(id),
			});

			const previousLists = queryClient.getQueryData<ListWithDetails[]>(
				queryKeys.lists.all,
			);
			const previousDetail = queryClient.getQueryData<ListWithDetails>(
				queryKeys.lists.detail(id),
			);

			queryClient.setQueryData<ListWithDetails[]>(queryKeys.lists.all, (old) =>
				old?.map((list) => (list.id === id ? { ...list, ...variables } : list)),
			);
			queryClient.setQueryData<ListWithDetails>(
				queryKeys.lists.detail(id),
				(old) => (old ? { ...old, ...variables } : old),
			);

			return { previousLists, previousDetail };
		},
		onError: (_err, _variables, context) => {
			if (context?.previousLists) {
				queryClient.setQueryData(queryKeys.lists.all, context.previousLists);
			}
			if (context?.previousDetail) {
				queryClient.setQueryData(
					queryKeys.lists.detail(id),
					context.previousDetail,
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.lists.all });
			queryClient.invalidateQueries({
				queryKey: queryKeys.lists.detail(id),
			});
		},
	});
};

export const useDeleteList = (id: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () =>
			apiClient.delete(`/api/lists/${id}`).then((res) => res.data),
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: queryKeys.lists.all });

			const previousLists = queryClient.getQueryData<ListWithDetails[]>(
				queryKeys.lists.all,
			);

			queryClient.setQueryData<ListWithDetails[]>(queryKeys.lists.all, (old) =>
				old?.filter((list) => list.id !== id),
			);

			return { previousLists };
		},
		onError: (_err, _variables, context) => {
			if (context?.previousLists) {
				queryClient.setQueryData(queryKeys.lists.all, context.previousLists);
			}
		},
		onSettled: () => {
			queryClient.removeQueries({ queryKey: queryKeys.lists.detail(id) });
			queryClient.invalidateQueries({ queryKey: queryKeys.lists.all });
		},
	});
};
