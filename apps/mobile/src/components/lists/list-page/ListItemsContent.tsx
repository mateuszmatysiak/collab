import type { CategoryType, ListItem } from "@collab-list/shared/types";
import {
	ChevronDown,
	ChevronRight,
	RotateCcw,
	Trash2,
} from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import {
	Alert,
	type FlatList,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	RefreshControl,
	View,
} from "react-native";
import DragList, { type DragListRenderItemInfo } from "react-native-draglist";
import {
	useDeleteCompletedItems,
	useReorderItems,
	useResetAllItems,
} from "@/api/items.api";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";
import { UNCATEGORIZED_FILTER } from "@/lib/constants";
import { AddItemCard } from "./AddItemCard";
import type { ItemFilter } from "./ItemFilters";
import { ListItemCard } from "./ListItemCard";

type DragListRef = FlatList<ListItem>;

function filterByStatus(items: ListItem[], filter: ItemFilter): ListItem[] {
	switch (filter) {
		case "completed":
			return items.filter((item) => item.isCompleted);
		case "incomplete":
			return items.filter((item) => !item.isCompleted);
		default:
			return items;
	}
}

function filterByCategory(
	items: ListItem[],
	categoryId: string | null,
): ListItem[] {
	if (categoryId === null) return items;
	if (categoryId === UNCATEGORIZED_FILTER) {
		return items.filter((item) => item.categoryId === null);
	}
	return items.filter((item) => item.categoryId === categoryId);
}

function filterBySearch(items: ListItem[], query: string): ListItem[] {
	if (!query) return items;
	const lower = query.toLowerCase();
	return items.filter((item) => item.title.toLowerCase().includes(lower));
}

function sortByPosition(items: ListItem[]): ListItem[] {
	return [...items].sort((a, b) => a.position - b.position);
}

interface ListItemsContentProps {
	listId: string;
	items: ListItem[];
	filter?: ItemFilter;
	categoryId?: string | null;
	filterCategoryId?: string | null;
	filterCategoryType?: CategoryType | null;
	searchQuery?: string;
	isRefetching: boolean;
	onRefresh: () => void;
}

export function ListItemsContent(props: ListItemsContentProps) {
	const {
		listId,
		items,
		filter = "all",
		categoryId = null,
		filterCategoryId = null,
		filterCategoryType = null,
		searchQuery = "",
		isRefetching,
		onRefresh,
	} = props;

	const listRef = useRef<DragListRef>(null);
	const [isCompletedExpanded, setIsCompletedExpanded] = useState(false);

	const { mutate: reorderItems } = useReorderItems(listId);
	const { mutate: resetAllItems, isPending: isResetting } =
		useResetAllItems(listId);
	const { mutate: deleteCompletedItems, isPending: isDeletingCompleted } =
		useDeleteCompletedItems(listId);

	const scrollToIndex = useCallback((index: number) => {
		setTimeout(() => {
			listRef.current?.scrollToIndex({
				index,
				animated: true,
				viewPosition: 0.5,
			});
		}, 50);
	}, []);

	const filteredItems = useMemo(() => {
		const byStatus = filterByStatus(items, filter);
		const byCategory = filterByCategory(byStatus, categoryId);
		return filterBySearch(byCategory, searchQuery);
	}, [items, filter, categoryId, searchQuery]);

	const pendingItems = useMemo(
		() => sortByPosition(filteredItems.filter((item) => !item.isCompleted)),
		[filteredItems],
	);

	const completedItems = useMemo(
		() => sortByPosition(filteredItems.filter((item) => item.isCompleted)),
		[filteredItems],
	);

	const showSections = filter === "all";
	const displayItems = showSections
		? pendingItems
		: sortByPosition(filteredItems);

	const handleReordered = useCallback(
		(fromIndex: number, toIndex: number) => {
			const movedItem = displayItems[fromIndex];
			const targetItem = displayItems[toIndex];
			if (!movedItem || !targetItem) return;

			const fullFromIndex = items.findIndex((item) => item.id === movedItem.id);
			const fullToIndex = items.findIndex((item) => item.id === targetItem.id);
			if (fullFromIndex === -1 || fullToIndex === -1) return;

			const newOrder = [...items];
			const [removed] = newOrder.splice(fullFromIndex, 1);
			if (!removed) return;
			newOrder.splice(fullToIndex, 0, removed);

			const itemIds = newOrder.map((item) => item.id);
			reorderItems({ itemIds });
		},
		[items, displayItems, reorderItems],
	);

	const renderItem = useCallback(
		(info: DragListRenderItemInfo<ListItem>) => {
			const { item, index, onDragStart, onDragEnd, isActive } = info;

			return (
				<View className="mb-3">
					<ListItemCard
						item={item}
						listId={listId}
						isActive={isActive}
						onDragStart={onDragStart}
						onDragEnd={onDragEnd}
						onInputFocus={() => scrollToIndex(index)}
					/>
				</View>
			);
		},
		[listId, scrollToIndex],
	);

	function handleResetAll() {
		Alert.alert(
			"Resetuj zaznaczenia",
			"Czy na pewno chcesz odznaczyć wszystkie elementy?",
			[
				{ text: "Anuluj", style: "cancel" },
				{
					text: "Resetuj",
					onPress: () => {
						resetAllItems(undefined, {
							onError: () => {
								Alert.alert("Błąd", "Nie udało się zresetować elementów.");
							},
						});
					},
				},
			],
		);
	}

	function handleDeleteCompleted() {
		Alert.alert(
			"Usuń zaznaczone",
			`Czy na pewno chcesz usunąć ${completedItems.length} zaznaczonych elementów?`,
			[
				{ text: "Anuluj", style: "cancel" },
				{
					text: "Usuń",
					style: "destructive",
					onPress: () => {
						deleteCompletedItems(undefined, {
							onSuccess: () => {
								setIsCompletedExpanded(false);
							},
							onError: () => {
								Alert.alert("Błąd", "Nie udało się usunąć elementów.");
							},
						});
					},
				},
			],
		);
	}

	const footerContent = (
		<View>
			{showSections && completedItems.length > 0 && (
				<View className="mt-2">
					<Pressable
						onPress={() => setIsCompletedExpanded((prev) => !prev)}
						className="flex-row items-center gap-2 py-3"
					>
						<Icon
							as={isCompletedExpanded ? ChevronDown : ChevronRight}
							className="text-muted-foreground"
							size={20}
						/>
						<Text className="text-sm font-medium text-muted-foreground">
							Ukończone ({completedItems.length})
						</Text>

						<View className="ml-auto flex-row gap-1">
							<Pressable
								onPress={handleResetAll}
								disabled={isResetting}
								className="size-8 items-center justify-center rounded-full active:bg-accent"
								hitSlop={4}
							>
								<Icon
									as={RotateCcw}
									className="text-muted-foreground"
									size={16}
								/>
							</Pressable>

							<Pressable
								onPress={handleDeleteCompleted}
								disabled={isDeletingCompleted}
								className="size-8 items-center justify-center rounded-full active:bg-destructive/10"
								hitSlop={4}
							>
								<Icon as={Trash2} className="text-destructive" size={16} />
							</Pressable>
						</View>
					</Pressable>

					{isCompletedExpanded &&
						completedItems.map((item) => (
							<View key={item.id} className="mb-3">
								<ListItemCard item={item} listId={listId} />
							</View>
						))}
				</View>
			)}

			<AddItemCard
				listId={listId}
				filterCategoryId={filterCategoryId}
				filterCategoryType={filterCategoryType}
			/>
		</View>
	);

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={{ flex: 1 }}
			keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 0}
		>
			<DragList
				ref={listRef}
				data={displayItems}
				keyExtractor={(item) => item.id}
				renderItem={renderItem}
				onReordered={handleReordered}
				contentContainerClassName="px-4 pb-5"
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				refreshControl={
					<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
				}
				ListEmptyComponent={
					searchQuery ? (
						<View className="items-center py-8">
							<Text className="text-muted-foreground">
								Brak wyników dla "{searchQuery}"
							</Text>
						</View>
					) : undefined
				}
				ListFooterComponent={footerContent}
			/>
		</KeyboardAvoidingView>
	);
}
