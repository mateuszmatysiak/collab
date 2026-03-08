import type { ListWithDetails } from "@collab-list/shared/types";
import { router } from "expo-router";
import { ListTodo } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";
import { useIsListOwner } from "@/hooks/useIsListOwner";
import { ManageUsers } from "./ManageUsers";

interface ListCardProps {
	list: ListWithDetails;
}

export function ListCard(props: ListCardProps) {
	const { list } = props;

	const isOwner = useIsListOwner(list);

	function handleCardPress() {
		router.push(`/(tabs)/lists/${list.id}`);
	}

	return (
		<Pressable onPress={handleCardPress}>
			<Card className="flex-row items-center gap-3 pl-4 pt-4 pb-3">
				<View className="size-10 items-center justify-center rounded-lg bg-primary/10">
					<Icon as={ListTodo} className="text-primary" size={20} />
				</View>

				<View className="flex-1 gap-1">
					<View className="flex-row items-center gap-2">
						<Text className="text-base font-medium">{list.name}</Text>
						{isOwner && (
							<View className="rounded-full bg-primary/10 px-2 py-0.5">
								<Text className="text-xs font-medium text-primary">Twoja</Text>
							</View>
						)}
					</View>
					<View className="flex-row items-center gap-2">
						<Text className="text-sm text-muted-foreground">
							{list.completedCount}/{list.itemsCount}
						</Text>
						<ManageUsers list={list} />
					</View>
				</View>
			</Card>
		</Pressable>
	);
}
