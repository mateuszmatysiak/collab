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
	usePermanentlyDeleteAllDeleted,
	useReorderItems,
	useResetAllItems,
	useRestoreAllDeleted,
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
import { DeletedItemCard } from "./DeletedItemCard";
import type { ItemFilter } from "./ItemFilters";
import { ListItemCard } from "./ListItemCard";

type DragListRef = FlatList<ListItem>;

function filterByStatus(items: ListItem[], filter: ItemFilter): ListItem[] {
	switch (filter) {
		case "completed":
			return items.filter((item) => item.isCompleted && !item.deletedAt);
		case "incomplete":
			return items.filter((item) => !item.isCompleted && !item.deletedAt);
		case "deleted":
			return items.filter((item) => item.deletedAt != null);
		default:
			return items.filter((item) => !item.deletedAt);
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
	onRefresh: () => Promise<void>;
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
		onRefresh,
	} = props;

	const [isManualRefreshing, setIsManualRefreshing] = useState(false);

	const handleManualRefresh = useCallback(async () => {
		setIsManualRefreshing(true);
		try {
			await onRefresh();
		} finally {
			setIsManualRefreshing(false);
		}
	}, [onRefresh]);

	const listRef = useRef<DragListRef>(null);
	const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const hiddenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const contentHeightRef = useRef(0);
	const layoutHeightRef = useRef(0);
	const footerHeightRef = useRef(0);
	const [isCompletedExpanded, setIsCompletedExpanded] = useState(true);
	const [isDeletedExpanded, setIsDeletedExpanded] = useState(true);
	const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isPermDeleteDialogOpen, setIsPermDeleteDialogOpen] = useState(false);
	const [isRestoreAllDialogOpen, setIsRestoreAllDialogOpen] = useState(false);
	const dialogCountRef = useRef(0);

	const { mutate: reorderItems } = useReorderItems(listId);
	const { mutate: resetAllItems, isPending: isResetting } =
		useResetAllItems(listId);
	const { mutate: deleteCompletedItems, isPending: isDeletingCompleted } =
		useDeleteCompletedItems(listId);
	const {
		mutate: permanentlyDeleteAllDeleted,
		isPending: isDeletingAllDeleted,
	} = usePermanentlyDeleteAllDeleted(listId);
	const { mutate: restoreAllDeleted, isPending: isRestoringAll } =
		useRestoreAllDeleted(listId);

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

	const deletedItems = useMemo(
		() => localItems.filter((item) => item.deletedAt != null),
		[localItems],
	);

	const showSections = filter === "all";
	const isDeletedFilter = filter === "deleted";
	const isCompletedFilter = filter === "completed";

	const displayItems =
		isDeletedFilter || isCompletedFilter
			? []
			: showSections
				? pendingItems
				: sortByPosition(filteredItems);

	const handleReordered = useCallback(
		(fromIndex: number, toIndex: number) => {
			const movedItem = displayItems[fromIndex];
			const targetItem = displayItems[toIndex];
			if (!movedItem || !targetItem) return;

			const activeItems = localItems.filter((item) => !item.deletedAt);
			const fullFromIndex = activeItems.findIndex(
				(item) => item.id === movedItem.id,
			);
			const fullToIndex = activeItems.findIndex(
				(item) => item.id === targetItem.id,
			);
			if (fullFromIndex === -1 || fullToIndex === -1) return;

			const newOrder = [...activeItems];
			const [removed] = newOrder.splice(fullFromIndex, 1);
			if (!removed) return;
			newOrder.splice(fullToIndex, 0, removed);

			const reorderedItems = newOrder.map((item, index) => ({
				...item,
				position: index,
			}));
			const deleted = localItems.filter((item) => item.deletedAt);
			setLocalItems([...reorderedItems, ...deleted]);

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

	function handleRestoreAllConfirm() {
		restoreAllDeleted(undefined, {
			onSuccess: () => {
				setIsRestoreAllDialogOpen(false);
				setIsDeletedExpanded(false);
			},
			onError: () => {
				Alert.alert("Błąd", "Nie udało się przywrócić elementów.");
			},
		});
	}

	function handlePermDeleteAllConfirm() {
		permanentlyDeleteAllDeleted(undefined, {
			onSuccess: () => {
				setIsPermDeleteDialogOpen(false);
				setIsDeletedExpanded(false);
			},
			onError: () => {
				Alert.alert("Błąd", "Nie udało się trwale usunąć elementów.");
			},
		});
	}

	const footerContent = (
		<View
			onLayout={(e) => {
				footerHeightRef.current = e.nativeEvent.layout.height;
			}}
		>
			{!isDeletedFilter && !isCompletedFilter && (
				<AddItemCard
					listId={listId}
					filterCategoryId={filterCategoryId}
					filterCategoryType={filterCategoryType}
					onInputFocus={scrollToAddItem}
				/>
			)}

			{isCompletedFilter &&
				(filteredItems.length > 0 ? (
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
								Ukończone ({filteredItems.length})
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
									onPress={() => {
										dialogCountRef.current =
											completedItems.length || filteredItems.length;
										setIsDeleteDialogOpen(true);
									}}
									disabled={isDeletingCompleted}
									className="size-8 items-center justify-center rounded-full active:bg-destructive/10"
									hitSlop={4}
								>
									<Icon as={Trash2} className="text-destructive" size={16} />
								</Pressable>
							</View>
						</Pressable>

						{isCompletedExpanded &&
							sortByPosition(filteredItems).map((item) => (
								<ListItemCard key={item.id} item={item} listId={listId} />
							))}
					</View>
				) : (
					<View className="items-center py-8">
						<Text className="text-muted-foreground">
							Brak ukończonych elementów
						</Text>
					</View>
				))}

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
								onPress={() => {
									dialogCountRef.current =
										completedItems.length || filteredItems.length;
									setIsDeleteDialogOpen(true);
								}}
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

			{((filter === "all" && deletedItems.length > 0) || isDeletedFilter) &&
				(deletedItems.length > 0 ? (
					<View className="mt-4 rounded-2xl border border-border bg-card px-3">
						<Pressable
							onPress={() => setIsDeletedExpanded((prev) => !prev)}
							className="flex-row items-center gap-2 py-3"
						>
							<Icon
								as={isDeletedExpanded ? ChevronDown : ChevronRight}
								className="text-muted-foreground"
								size={20}
							/>
							<Text className="text-sm font-medium text-muted-foreground">
								Usunięte ({deletedItems.length})
							</Text>

							<View className="ml-auto flex-row gap-1">
								<Pressable
									onPress={() => {
										dialogCountRef.current = deletedItems.length;
										setIsRestoreAllDialogOpen(true);
									}}
									disabled={isRestoringAll}
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
									onPress={() => {
										dialogCountRef.current = deletedItems.length;
										setIsPermDeleteDialogOpen(true);
									}}
									disabled={isDeletingAllDeleted}
									className="size-8 items-center justify-center rounded-full active:bg-destructive/10"
									hitSlop={4}
								>
									<Icon as={Trash2} className="text-destructive" size={16} />
								</Pressable>
							</View>
						</Pressable>

						{isDeletedExpanded &&
							deletedItems.map((item) => (
								<DeletedItemCard key={item.id} item={item} listId={listId} />
							))}
					</View>
				) : (
					<View className="items-center py-8">
						<Text className="text-muted-foreground">
							Brak usuniętych elementów
						</Text>
					</View>
				))}
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
					onContentSizeChange={(_w, h) => {
						contentHeightRef.current = h;
					}}
					onLayout={(e) => {
						layoutHeightRef.current = e.nativeEvent.layout.height;
					}}
					contentContainerClassName="px-5 pb-28"
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
					refreshControl={
						<RefreshControl
							refreshing={isManualRefreshing}
							onRefresh={handleManualRefresh}
						/>
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
							Czy na pewno chcesz usunąć {dialogCountRef.current} zaznaczonych
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

			<Dialog
				open={isPermDeleteDialogOpen}
				onOpenChange={setIsPermDeleteDialogOpen}
			>
				<DialogContent variant="centered">
					<DialogHeader>
						<DialogTitle>Trwałe usunięcie</DialogTitle>
						<DialogDescription>
							Czy na pewno chcesz trwale usunąć {dialogCountRef.current}{" "}
							elementów? Tej operacji nie można cofnąć.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onPress={() => setIsPermDeleteDialogOpen(false)}
							disabled={isDeletingAllDeleted}
						>
							<Text>Anuluj</Text>
						</Button>
						<Button
							variant="destructive"
							onPress={handlePermDeleteAllConfirm}
							disabled={isDeletingAllDeleted}
						>
							<Text>
								{isDeletingAllDeleted ? "Usuwanie..." : "Usuń trwale"}
							</Text>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<Dialog
				open={isRestoreAllDialogOpen}
				onOpenChange={setIsRestoreAllDialogOpen}
			>
				<DialogContent variant="centered">
					<DialogHeader>
						<DialogTitle>Przywróć wszystkie</DialogTitle>
						<DialogDescription>
							Czy na pewno chcesz przywrócić {dialogCountRef.current} usuniętych
							elementów?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onPress={() => setIsRestoreAllDialogOpen(false)}
							disabled={isRestoringAll}
						>
							<Text>Anuluj</Text>
						</Button>
						<Button onPress={handleRestoreAllConfirm} disabled={isRestoringAll}>
							<Text>{isRestoringAll ? "Przywracanie..." : "Przywróć"}</Text>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
