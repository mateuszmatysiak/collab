import type { CategoryType } from "@collab-list/shared/types";
import { useLocalSearchParams } from "expo-router";
import { Search, X } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useItems } from "@/api/items.api";
import { useList } from "@/api/lists.api";
import { CategoryFilters } from "@/components/lists/list-page/CategoryFilters";
import {
	type ItemFilter,
	ItemFilters,
} from "@/components/lists/list-page/ItemFilters";
import { ListHeader } from "@/components/lists/list-page/ListHeader";
import { ListItemsContent } from "@/components/lists/list-page/ListItemsContent";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { useDebounce } from "@/hooks/useDebounce";

interface ListDetailContentProps {
	id: string;
}

function ListDetailContent(props: ListDetailContentProps) {
	const { id } = props;

	const {
		data: list,
		isLoading: isListLoading,
		isError: isListError,
		refetch: refetchList,
	} = useList(id);
	const {
		data: items,
		isLoading: isItemsLoading,
		isError: isItemsError,
		isRefetching,
		refetch: refetchItems,
	} = useItems(id);

	const [filter, setFilter] = useState<ItemFilter>("all");
	const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
		null,
	);
	const [selectedCategoryType, setSelectedCategoryType] =
		useState<CategoryType | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [isSearchVisible, setIsSearchVisible] = useState(false);
	const debouncedSearch = useDebounce(searchQuery.trim(), 300);

	const handleFilterChange = useCallback((newFilter: ItemFilter) => {
		setFilter(newFilter);
	}, []);

	const handleCategoryChange = useCallback(
		(categoryId: string | null, categoryType: string | null) => {
			setSelectedCategoryId(categoryId);
			setSelectedCategoryType(categoryType as CategoryType | null);
		},
		[],
	);

	const handleRefresh = useCallback(() => {
		refetchItems();
		refetchList();
	}, [refetchItems, refetchList]);

	const handleToggleSearch = useCallback(() => {
		setIsSearchVisible((prev) => {
			if (prev) setSearchQuery("");
			return !prev;
		});
	}, []);

	const isLoading = isListLoading || isItemsLoading;
	const isError = isListError || isItemsError;

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center">
				<ActivityIndicator size="large" />
			</View>
		);
	}

	if (!list) {
		return (
			<View className="flex-1 items-center justify-center">
				<Text className="text-lg font-medium text-destructive">
					Lista nie znaleziona
				</Text>
			</View>
		);
	}

	if (!items) {
		return (
			<View className="flex-1 items-center justify-center">
				<Text className="text-lg font-medium text-destructive">
					Lista nie ma elementów
				</Text>
			</View>
		);
	}

	if (isError) {
		return (
			<View className="flex-1 items-center justify-center gap-2 px-6">
				<Text className="text-lg font-medium text-destructive">
					Błąd ładowania listy
				</Text>
				<Pressable onPress={handleRefresh}>
					<Text className="text-primary underline">Spróbuj ponownie</Text>
				</Pressable>
			</View>
		);
	}

	return (
		<>
			<ListHeader
				list={list}
				onToggleSearch={handleToggleSearch}
				isSearchVisible={isSearchVisible}
			/>

			{isSearchVisible && (
				<View className="px-6 pb-3">
					<View
						className="flex-row items-center gap-2 rounded-lg border border-border bg-background px-3"
						pointerEvents="box-none"
					>
						<Icon
							as={Search}
							className="text-muted-foreground"
							pointerEvents="none"
							size={18}
						/>
						<Input
							placeholder="Szukaj elementów..."
							value={searchQuery}
							onChangeText={setSearchQuery}
							autoFocus
							className="flex-1 border-0 bg-transparent px-0 shadow-none"
						/>
						{searchQuery.length > 0 && (
							<Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
								<Icon as={X} className="text-muted-foreground" size={18} />
							</Pressable>
						)}
					</View>
				</View>
			)}

			<ItemFilters filter={filter} onFilterChange={handleFilterChange} />

			<CategoryFilters
				listId={id}
				selectedCategoryId={selectedCategoryId}
				onCategoryChange={handleCategoryChange}
			/>

			<ListItemsContent
				listId={id}
				items={items}
				filter={filter}
				categoryId={selectedCategoryId}
				filterCategoryId={selectedCategoryId}
				filterCategoryType={selectedCategoryType}
				searchQuery={debouncedSearch}
				isRefetching={isRefetching}
				onRefresh={handleRefresh}
			/>
		</>
	);
}

export default function ListDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();

	if (!id) {
		return (
			<SafeAreaView className="flex-1 bg-background" edges={["top"]}>
				<View className="flex-1 items-center justify-center">
					<Text className="text-lg font-medium text-destructive">
						Nieprawidłowy identyfikator listy
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-background" edges={["top"]}>
			<ListDetailContent key={id} id={id} />
		</SafeAreaView>
	);
}
