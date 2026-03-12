import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLists } from "@/api/lists.api";
import { LogoutDialog } from "@/components/auth/LogoutDialog";
import { ListFilters } from "@/components/lists/lists-page/ListFilters";
import {
	type ListFilter,
	ListsContent,
} from "@/components/lists/lists-page/ListsContent";
import { Text } from "@/components/ui/Text";
import { pluralize } from "@/lib/utils";

export default function ListsScreen() {
	const [filter, setFilter] = useState<ListFilter>("all");
	const { data: lists } = useLists();

	const count = lists?.length ?? 0;
	const listsCountLabel = `${count} ${pluralize(count, "lista", "listy", "list")}`;

	return (
		<SafeAreaView className="flex-1 bg-background" edges={["top"]}>
			<View className="flex-1">
				<View className="mx-5 mt-3 flex-row items-center px-1 py-4">
					<View className="flex-1">
						<Text className="text-3xl font-bold text-foreground">
							Moje listy
						</Text>
						<Text className="text-sm text-muted-foreground">
							{listsCountLabel}
						</Text>
					</View>
					<LogoutDialog />
				</View>

				<ListFilters filter={filter} onFilterChange={setFilter} />

				<ListsContent filter={filter} />
			</View>
		</SafeAreaView>
	);
}
