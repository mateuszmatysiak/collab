import type { CategoryType } from "@collab-list/shared/types";
import { useLocalSearchParams } from "expo-router";
import { Search, X } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, TextInput, View } from "react-native";
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
import { Text } from "@/components/ui/Text";
import { useDebounce } from "@/hooks/useDebounce";

function SkeletonPulse(props: {
	children: React.ReactNode;
	className?: string;
}) {
	const opacity = useRef(new Animated.Value(0.3)).current;

	useEffect(() => {
		const animation = Animated.loop(
			Animated.sequence([
				Animated.timing(opacity, {
					toValue: 1,
					duration: 800,
					useNativeDriver: true,
				}),
				Animated.timing(opacity, {
					toValue: 0.3,
					duration: 800,
					useNativeDriver: true,
				}),
			]),
		);
		animation.start();
		return () => animation.stop();
	}, [opacity]);

	return (
		<Animated.View style={{ opacity }} className={props.className}>
			{props.children}
		</Animated.View>
	);
}

function ListItemSkeleton() {
	return (
		<View className="mb-2 flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4">
			<View className="size-5 rounded bg-muted-foreground/10" />
			<View className="flex-1 gap-2">
				<View className="h-4 w-3/4 rounded bg-muted-foreground/10" />
			</View>
			<View className="size-5 rounded bg-muted-foreground/10" />
		</View>
	);
}

function ListDetailSkeleton() {
	return (
		<View className="flex-1 bg-background">
			<SkeletonPulse className="px-5 pt-4 pb-3">
				<View className="flex-row items-center gap-3 mb-4">
					<View className="size-10 rounded-full bg-muted-foreground/10" />
					<View className="flex-1 gap-2">
						<View className="h-6 w-48 rounded bg-muted-foreground/10" />
						<View className="h-3 w-24 rounded bg-muted-foreground/10" />
					</View>
				</View>

				<View className="flex-row gap-3 mb-4">
					<View className="h-10 flex-1 rounded-xl bg-muted-foreground/10" />
					<View className="h-10 flex-1 rounded-xl bg-muted-foreground/10" />
				</View>

				<View className="gap-2">
					<ListItemSkeleton />
					<ListItemSkeleton />
					<ListItemSkeleton />
					<ListItemSkeleton />
					<ListItemSkeleton />
				</View>
			</SkeletonPulse>
		</View>
	);
}

interface ListDetailContentProps {
	id: string;
}

export function ListDetailContent(props: ListDetailContentProps) {
	const { id } = props;

	const {
		data: list,
		isLoading: isListLoading,
		isError: isListError,
		refetch: refetchList,
	} = useList(id);
	const {
		data: items,
		isError: isItemsError,
		isPlaceholderData,
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
	const searchInputRef = useRef<TextInput>(null);
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

	const handleRefresh = useCallback(async () => {
		await Promise.all([refetchItems(), refetchList()]);
	}, [refetchItems, refetchList]);

	const handleToggleSearch = useCallback(() => {
		setIsSearchVisible((prev) => {
			if (prev) setSearchQuery("");
			return !prev;
		});
	}, []);

	const isError = isListError || isItemsError;
	const activeItems = items?.filter((item) => !item.deletedAt) ?? [];
	const completedCount = activeItems.filter((item) => item.isCompleted).length;
	const totalCount = activeItems.length;

	if (isListLoading || isPlaceholderData) {
		return <ListDetailSkeleton />;
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

	if (isError && !items) {
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
		<View className="flex-1 bg-background">
			<ListHeader
				list={list}
				onToggleSearch={handleToggleSearch}
				isSearchVisible={isSearchVisible}
				completedCount={completedCount}
				totalCount={totalCount}
			/>

			{isSearchVisible && (
				<View className="px-5 pb-3">
					<View className="h-12 flex-row items-center gap-2 rounded-xl border border-border bg-card px-3">
						<Icon as={Search} className="text-muted-foreground" size={18} />
						<TextInput
							ref={searchInputRef}
							placeholder="Szukaj elementów..."
							placeholderTextColor="#94a3b8"
							value={searchQuery}
							onChangeText={setSearchQuery}
							autoFocus
							blurOnSubmit={false}
							returnKeyType="search"
							className="flex-1 text-base text-foreground"
							style={{ padding: 0 }}
						/>
						{searchQuery.length > 0 && (
							<Pressable
								onPress={() => {
									setSearchQuery("");
									searchInputRef.current?.focus();
								}}
								hitSlop={8}
							>
								<Icon as={X} className="text-muted-foreground" size={18} />
							</Pressable>
						)}
					</View>
				</View>
			)}

			<View className="z-20 flex-row gap-3 px-5 pb-4">
				<View className="flex-1 gap-1">
					<Text className="text-xs font-medium text-muted-foreground ml-1">
						Status
					</Text>
					<ItemFilters
						filter={filter}
						onFilterChange={handleFilterChange}
						compact
					/>
				</View>
				<View className="flex-1 gap-1">
					<Text className="text-xs font-medium text-muted-foreground ml-1">
						Kategoria
					</Text>
					<CategoryFilters
						listId={id}
						selectedCategoryId={selectedCategoryId}
						onCategoryChange={handleCategoryChange}
						compact
					/>
				</View>
			</View>

			<ListItemsContent
				listId={id}
				items={items ?? []}
				filter={filter}
				categoryId={selectedCategoryId}
				filterCategoryId={selectedCategoryId}
				filterCategoryType={selectedCategoryType}
				searchQuery={debouncedSearch}
				onRefresh={handleRefresh}
			/>
		</View>
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
