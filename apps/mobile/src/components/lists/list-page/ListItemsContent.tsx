import type { CategoryType, ListItem } from "@collab-list/shared/types";
import {
	ChevronDown,
	ChevronRight,
	RotateCcw,
	Trash2,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { Button } from "@/components/ui/Button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/Dialog";
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
	const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const hiddenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const contentHeightRef = useRef(0);
	const layoutHeightRef = useRef(0);
	const footerHeightRef = useRef(0);
	const [isCompletedExpanded, setIsCompletedExpanded] = useState(true);
	const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const { mutate: reorderItems } = useReorderItems(listId);
	const { mutate: resetAllItems, isPending: isResetting } =
		useResetAllItems(listId);
	const { mutate: deleteCompletedItems, isPending: isDeletingCompleted } =
		useDeleteCompletedItems(listId);

	const [localItems, setLocalItems] = useState(items);
	const prevItemsRef = useRef(items);
	const [hiddenCompletedIds, setHiddenCompletedIds] = useState<Set<string>>(
		() => new Set(),
	);

	useEffect(() => {
		const prevItems = prevItemsRef.current;
		prevItemsRef.current = items;

		const newlyCompleted: string[] = [];
		for (const item of items) {
			const prev = prevItems.find((p) => p.id === item.id);
			if (prev && !prev.isCompleted && item.isCompleted) {
				newlyCompleted.push(item.id);
			}
		}

		if (newlyCompleted.length > 0) {
			setHiddenCompletedIds((prev) => {
				const next = new Set(prev);
				for (const id of newlyCompleted) next.add(id);
				return next;
			});

			if (hiddenTimerRef.current) clearTimeout(hiddenTimerRef.current);
			hiddenTimerRef.current = setTimeout(() => {
				setHiddenCompletedIds((prev) => {
					const next = new Set(prev);
					for (const id of newlyCompleted) next.delete(id);
					return next;
				});
			}, 100);
		}

		setLocalItems(items);

		return () => {
			if (hiddenTimerRef.current) clearTimeout(hiddenTimerRef.current);
		};
	}, [items]);

	const scrollToIndex = useCallback((index: number) => {
		if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
		scrollTimerRef.current = setTimeout(() => {
			listRef.current?.scrollToIndex({
				index,
				animated: true,
				viewPosition: 0.5,
			});
		}, 250);
	}, []);

	const scrollToAddItem = useCallback(() => {
		if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
		scrollTimerRef.current = setTimeout(() => {
			const addItemCardTop = contentHeightRef.current - footerHeightRef.current;
			const offset = addItemCardTop - layoutHeightRef.current + 200;
			if (offset > 0) {
				listRef.current?.scrollToOffset({ offset, animated: true });
			} else {
				listRef.current?.scrollToEnd({ animated: true });
			}
		}, 250);
	}, []);

	const filteredItems = useMemo(() => {
		const byStatus = filterByStatus(localItems, filter);
		const byCategory = filterByCategory(byStatus, categoryId);
		return filterBySearch(byCategory, searchQuery);
	}, [localItems, filter, categoryId, searchQuery]);

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

			const fullFromIndex = localItems.findIndex(
				(item) => item.id === movedItem.id,
			);
			const fullToIndex = localItems.findIndex(
				(item) => item.id === targetItem.id,
			);
			if (fullFromIndex === -1 || fullToIndex === -1) return;

			const newOrder = [...localItems];
			const [removed] = newOrder.splice(fullFromIndex, 1);
			if (!removed) return;
			newOrder.splice(fullToIndex, 0, removed);

			const reorderedItems = newOrder.map((item, index) => ({
				...item,
				position: index,
			}));
			setLocalItems(reorderedItems);

			const itemIds = newOrder.map((item) => item.id);
			reorderItems({ itemIds });
		},
		[localItems, displayItems, reorderItems],
	);

	const renderItem = useCallback(
		(info: DragListRenderItemInfo<ListItem>) => {
			const { item, index, onDragStart, onDragEnd, isActive } = info;

			return (
				<ListItemCard
					item={item}
					listId={listId}
					isActive={isActive}
					onDragStart={onDragStart}
					onDragEnd={onDragEnd}
					onInputFocus={() => scrollToIndex(index)}
				/>
			);
		},
		[listId, scrollToIndex],
	);

	function handleResetAllConfirm() {
		resetAllItems(undefined, {
			onSuccess: () => {
				setIsResetDialogOpen(false);
			},
			onError: () => {
				Alert.alert("Błąd", "Nie udało się zresetować elementów.");
			},
		});
	}

	function handleDeleteCompletedConfirm() {
		deleteCompletedItems(undefined, {
			onSuccess: () => {
				setIsDeleteDialogOpen(false);
				setIsCompletedExpanded(false);
			},
			onError: () => {
				Alert.alert("Błąd", "Nie udało się usunąć elementów.");
			},
		});
	}

	const footerContent = (
		<View onLayout={(e) => { footerHeightRef.current = e.nativeEvent.layout.height; }}>
			<AddItemCard
				listId={listId}
				filterCategoryId={filterCategoryId}
				filterCategoryType={filterCategoryType}
				onInputFocus={scrollToAddItem}
			/>

			{showSections && completedItems.length > 0 && (
				<View className="mt-4 rounded-2xl border border-border bg-card px-3">
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
								onPress={() => setIsResetDialogOpen(true)}
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
								onPress={() => setIsDeleteDialogOpen(true)}
								disabled={isDeletingCompleted}
								className="size-8 items-center justify-center rounded-full active:bg-destructive/10"
								hitSlop={4}
							>
								<Icon as={Trash2} className="text-destructive" size={16} />
							</Pressable>
						</View>
					</Pressable>

					{isCompletedExpanded &&
						completedItems
							.filter((item) => !hiddenCompletedIds.has(item.id))
							.map((item) => (
								<ListItemCard key={item.id} item={item} listId={listId} />
							))}
				</View>
			)}
		</View>
	);

	return (
		<>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={{ flex: 1 }}
				keyboardVerticalOffset={Platform.OS === "ios" ? 160 : 0}
			>
				<DragList
					ref={listRef}
					data={displayItems}
					extraData={localItems}
					keyExtractor={(item) => item.id}
					renderItem={renderItem}
					onReordered={handleReordered}
					onContentSizeChange={(_w, h) => { contentHeightRef.current = h; }}
					onLayout={(e) => { layoutHeightRef.current = e.nativeEvent.layout.height; }}
					contentContainerClassName="px-5 pb-28"
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

			<Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
				<DialogContent variant="centered">
					<DialogHeader>
						<DialogTitle>Resetuj zaznaczenia</DialogTitle>
						<DialogDescription>
							Czy na pewno chcesz odznaczyć wszystkie elementy?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onPress={() => setIsResetDialogOpen(false)}
							disabled={isResetting}
						>
							<Text>Anuluj</Text>
						</Button>
						<Button onPress={handleResetAllConfirm} disabled={isResetting}>
							<Text>{isResetting ? "Resetowanie..." : "Resetuj"}</Text>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent variant="centered">
					<DialogHeader>
						<DialogTitle>Usuń zaznaczone</DialogTitle>
						<DialogDescription>
							Czy na pewno chcesz usunąć {completedItems.length} zaznaczonych
							elementów?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onPress={() => setIsDeleteDialogOpen(false)}
							disabled={isDeletingCompleted}
						>
							<Text>Anuluj</Text>
						</Button>
						<Button
							variant="destructive"
							onPress={handleDeleteCompletedConfirm}
							disabled={isDeletingCompleted}
						>
							<Text>{isDeletingCompleted ? "Usuwanie..." : "Usuń"}</Text>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
