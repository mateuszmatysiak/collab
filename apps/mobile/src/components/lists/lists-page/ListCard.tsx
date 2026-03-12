import type { ListWithDetails } from "@collab-list/shared/types";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { ListTodo } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { fetchItems } from "@/api/items.api";
import { queryKeys } from "@/api/queryKeys";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";
import { useIsListOwner } from "@/hooks/useIsListOwner";
import { pluralize } from "@/lib/utils";
import { ManageUsers } from "./ManageUsers";

interface ListCardProps {
	list: ListWithDetails;
}

export function ListCard(props: ListCardProps) {
	const { list } = props;

	const isOwner = useIsListOwner(list);
	const queryClient = useQueryClient();

	function handleCardPress() {
		queryClient.setQueryData<ListWithDetails>(
			queryKeys.lists.detail(list.id),
			list,
		);

		queryClient.prefetchQuery({
			queryKey: queryKeys.lists.items(list.id),
			queryFn: () => fetchItems(list.id),
		});

		router.push(`/(tabs)/lists/${list.id}`);
	}

	return (
		<Pressable onPress={handleCardPress}>
			<View className="rounded-2xl border border-border bg-card px-4 pb-3 pt-4">
				<View className="flex-row items-center gap-3">
					<View
						className={`size-12 items-center justify-center rounded-xl ${isOwner ? "bg-blue-100 dark:bg-blue-500/20" : "bg-purple-100 dark:bg-purple-500/20"}`}
					>
						<Icon
							as={ListTodo}
							className={
								isOwner
									? "text-primary"
									: "text-purple-600 dark:text-purple-400"
							}
							size={22}
						/>
					</View>

					<View className="flex-1 gap-0.5">
						<View className="flex-row items-center gap-2">
							<Text className="text-base font-semibold text-foreground">
								{list.name}
							</Text>
							{isOwner && (
								<View className="rounded-full bg-primary/10 px-2 py-0.5">
									<Text className="text-xs font-medium text-primary">Moja</Text>
								</View>
							)}
						</View>
						<Text className="text-sm text-muted-foreground">
							{list.itemsCount}{" "}
							{pluralize(list.itemsCount, "element", "elementy", "elementów")}
						</Text>
					</View>

					<ManageUsers list={list} />
				</View>

				<View className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary/15">
					<View
						className="h-1.5 rounded-full bg-primary"
						style={{
							width: `${list.itemsCount === 0 ? 0 : (list.completedCount / list.itemsCount) * 100}%`,
						}}
					/>
				</View>
			</View>
		</Pressable>
	);
}
