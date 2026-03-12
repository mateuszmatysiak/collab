import type { Category, ListCategory } from "@collab-list/shared/types";
import type {
	CreateCategoryRequest,
	UpdateCategoryRequest,
} from "@collab-list/shared/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { queryKeys } from "./queryKeys";

export const useUserCategories = () => {
	return useQuery<Category[]>({
		queryKey: queryKeys.categories.user,
		queryFn: () =>
			apiClient
				.get<{ categories: Category[] }>("/api/categories/user")
				.then((res) => res.data.categories),
	});
};

export const useCreateUserCategory = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateCategoryRequest) =>
			apiClient
				.post<{ category: Category }>("/api/categories/user", data)
				.then((res) => res.data),
		onSuccess: (data) => {
			queryClient.setQueryData<Category[]>(queryKeys.categories.user, (old) =>
				old ? [...old, data.category] : [data.category],
			);
		},
	});
};

export const useUpdateUserCategory = (id: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateCategoryRequest) =>
			apiClient.patch(`/api/categories/${id}`, data).then((res) => res.data),
		onMutate: async (variables) => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.categories.user,
			});

			const previousCategories = queryClient.getQueryData<Category[]>(
				queryKeys.categories.user,
			);

			queryClient.setQueryData<Category[]>(queryKeys.categories.user, (old) =>
				old?.map((cat) => (cat.id === id ? { ...cat, ...variables } : cat)),
			);

			return { previousCategories };
		},
		onError: (_err, _variables, context) => {
			if (context?.previousCategories) {
				queryClient.setQueryData(
					queryKeys.categories.user,
					context.previousCategories,
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.categories.user,
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.lists.all });
			queryClient.invalidateQueries({ queryKey: queryKeys.categories.listAll });
		},
	});
};

export const useDeleteUserCategory = (id: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () =>
			apiClient.delete(`/api/categories/${id}`).then((res) => res.data),
		onMutate: async () => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.categories.user,
			});

			const previousCategories = queryClient.getQueryData<Category[]>(
				queryKeys.categories.user,
			);

			queryClient.setQueryData<Category[]>(queryKeys.categories.user, (old) =>
				old?.filter((cat) => cat.id !== id),
			);

			return { previousCategories };
		},
		onError: (_err, _variables, context) => {
			if (context?.previousCategories) {
				queryClient.setQueryData(
					queryKeys.categories.user,
					context.previousCategories,
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.categories.user,
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.lists.all });
			queryClient.invalidateQueries({ queryKey: queryKeys.categories.listAll });
		},
	});
};

export const useListCategories = (listId: string) => {
	return useQuery<ListCategory[]>({
		queryKey: queryKeys.categories.list(listId),
		queryFn: () =>
			apiClient
				.get<{ categories: ListCategory[] }>(`/api/lists/${listId}/categories`)
				.then((res) => res.data.categories),
		enabled: !!listId,
	});
};

export const useCreateLocalCategory = (listId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateCategoryRequest) =>
			apiClient
				.post<{ category: ListCategory }>(
					`/api/lists/${listId}/categories/local`,
					data,
				)
				.then((res) => res.data),
		onSuccess: (data) => {
			queryClient.setQueryData<ListCategory[]>(
				queryKeys.categories.list(listId),
				(old) => (old ? [...old, data.category] : [data.category]),
			);
			queryClient.invalidateQueries({
				queryKey: queryKeys.categories.list(listId),
			});
			if (data.category.type === "user") {
				queryClient.invalidateQueries({ queryKey: queryKeys.categories.user });
			}
		},
	});
};

export const useSaveLocalToUser = (listId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (categoryId: string) =>
			apiClient
				.post<{ category: Category }>(
					`/api/lists/${listId}/categories/local/${categoryId}/save-to-user`,
				)
				.then((res) => res.data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.categories.user });
			queryClient.invalidateQueries({
				queryKey: queryKeys.categories.list(listId),
			});
		},
	});
};

export const useImportLocalToOwner = (listId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (categoryId: string) =>
			apiClient
				.post<{ category: Category }>(
					`/api/lists/${listId}/categories/local/${categoryId}/import-to-owner`,
				)
				.then((res) => res.data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.categories.user });
			queryClient.invalidateQueries({
				queryKey: queryKeys.categories.list(listId),
			});
		},
	});
};

export const useDeleteLocalCategory = (listId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (categoryId: string) =>
			apiClient
				.delete(`/api/lists/${listId}/categories/local/${categoryId}`)
				.then((res) => res.data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.categories.list(listId),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.lists.all });
		},
	});
};
