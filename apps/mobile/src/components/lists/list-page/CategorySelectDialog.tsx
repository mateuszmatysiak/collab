import type { CategoryType, ListCategory } from "@collab-list/shared/types";
import { Ban, Plus, Search } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";
import {
	useCreateLocalCategory,
	useDeleteLocalCategory,
	useImportLocalToOwner,
	useListCategories,
	useSaveLocalToUser,
} from "@/api/categories.api";
import { useList } from "@/api/lists.api";
import { IconPicker, POPULAR_ICONS } from "@/components/categories/IconPicker";
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
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Text } from "@/components/ui/Text";
import { useDebounce } from "@/hooks/useDebounce";
import { useIsListOwner } from "@/hooks/useIsListOwner";
import { MAX_CATEGORY_NAME_LENGTH } from "@/lib/constants";
import { getCategoryIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 300;

interface CategorySelectDialogProps {
	listId: string;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	currentCategoryId: string | null;
	onSelectCategory: (
		categoryId: string | null,
		categoryType: CategoryType | null,
	) => void;
}

export function CategorySelectDialog(props: CategorySelectDialogProps) {
	const { listId, isOpen, onOpenChange, currentCategoryId, onSelectCategory } =
		props;

	const [searchQuery, setSearchQuery] = useState("");
	const [isCreatingNew, setIsCreatingNew] = useState(false);
	const [newCategoryName, setNewCategoryName] = useState("");
	const [newCategoryIcon, setNewCategoryIcon] = useState<string>(
		POPULAR_ICONS[0],
	);
	const [nameError, setNameError] = useState("");
	const [actionDialogCategory, setActionDialogCategory] =
		useState<ListCategory | null>(null);

	const debouncedQuery = useDebounce(searchQuery.trim(), DEBOUNCE_MS);
	const { data: categories = [] } = useListCategories(listId);
	const { data: list } = useList(listId);
	const isOwner = useIsListOwner(list ?? { authorId: "" });

	const { mutate: createLocalCategory, isPending: isCreating } =
		useCreateLocalCategory(listId);
	const { mutate: saveLocalToUser } = useSaveLocalToUser(listId);
	const { mutate: importLocalToOwner } = useImportLocalToOwner(listId);
	const { mutate: deleteLocalCategory } = useDeleteLocalCategory(listId);

	const filteredCategories = useMemo(() => {
		if (!debouncedQuery) return categories;

		const query = debouncedQuery.toLowerCase();
		return categories.filter((cat) => cat.name.toLowerCase().includes(query));
	}, [categories, debouncedQuery]);

	const hasExactMatch = useMemo(() => {
		if (!debouncedQuery) return true;
		const query = debouncedQuery.toLowerCase();
		return categories.some((cat) => cat.name.toLowerCase() === query);
	}, [categories, debouncedQuery]);

	const showCreateOption =
		debouncedQuery.length > 0 && !hasExactMatch && !isCreatingNew;

	function handleSelectCategory(category: ListCategory) {
		onSelectCategory(category.id, category.type);
		handleClose();
	}

	function handleLongPressCategory(category: ListCategory) {
		setActionDialogCategory(category);
	}

	function handleCloseActionDialog() {
		setActionDialogCategory(null);
	}

	function handleAddToDictionary() {
		if (!actionDialogCategory) return;

		const category = actionDialogCategory;

		if (isOwner) {
			importLocalToOwner(category.id, {
				onSuccess: () => {
					handleCloseActionDialog();
				},
				onError: () => {
					Alert.alert("Błąd", "Nie udało się dodać kategorii do słownika.");
				},
			});
		} else {
			saveLocalToUser(category.id, {
				onSuccess: () => {
					handleCloseActionDialog();
				},
				onError: () => {
					Alert.alert("Błąd", "Nie udało się dodać kategorii do słownika.");
				},
			});
		}
	}

	function handleDeleteLocal() {
		if (!actionDialogCategory) return;

		Alert.alert(
			"Usuń kategorię",
			`Czy na pewno chcesz usunąć kategorię "${actionDialogCategory.name}"?`,
			[
				{
					text: "Anuluj",
					style: "cancel",
				},
				{
					text: "Usuń",
					style: "destructive",
					onPress: () => {
						deleteLocalCategory(actionDialogCategory.id, {
							onSuccess: () => {
								handleCloseActionDialog();
							},
							onError: () => {
								Alert.alert("Błąd", "Nie udało się usunąć kategorii.");
							},
						});
					},
				},
			],
		);
	}

	function handleRemoveCategory() {
		onSelectCategory(null, null);
		handleClose();
	}

	function handleStartCreating() {
		setIsCreatingNew(true);
		setNewCategoryName(searchQuery.trim());
		setNewCategoryIcon(POPULAR_ICONS[0]);
		setNameError("");
	}

	function handleCancelCreating() {
		setIsCreatingNew(false);
		setNewCategoryName("");
		setNewCategoryIcon(POPULAR_ICONS[0]);
		setNameError("");
	}

	function handleCreateAndAssign() {
		const trimmedName = newCategoryName.trim();

		if (!trimmedName) {
			setNameError("Nazwa kategorii jest wymagana");
			return;
		}

		setNameError("");

		createLocalCategory(
			{ name: trimmedName, icon: newCategoryIcon },
			{
				onSuccess: (data) => {
					onSelectCategory(data.category.id, data.category.type);
					handleClose();
				},
				onError: () => {
					Alert.alert(
						"Błąd",
						"Nie udało się utworzyć kategorii. Spróbuj ponownie.",
					);
				},
			},
		);
	}

	function handleClose() {
		setSearchQuery("");
		setIsCreatingNew(false);
		setNewCategoryName("");
		setNewCategoryIcon(POPULAR_ICONS[0]);
		setNameError("");
		onOpenChange(false);
	}

	function handleOpenChange(open: boolean) {
		if (!open) {
			handleClose();
		} else {
			onOpenChange(true);
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Wybierz kategorię</DialogTitle>
					<DialogDescription>
						Przypisz kategorię do elementu lub utwórz nową.
					</DialogDescription>
				</DialogHeader>

				{!isCreatingNew ? (
					<>
						<View
							className="flex-row items-center gap-2 rounded-xl border border-input bg-card dark:bg-background px-3 h-12"
							pointerEvents="box-none"
						>
							<Icon
								as={Search}
								className="text-muted-foreground"
								pointerEvents="none"
								size={18}
							/>
							<Input
								placeholder="Szukaj kategorii..."
								value={searchQuery}
								onChangeText={setSearchQuery}
								className="flex-1 border-0 bg-transparent dark:bg-transparent px-0 h-auto shadow-none"
								maxLength={MAX_CATEGORY_NAME_LENGTH}
							/>
						</View>

						<ScrollView
							className="max-h-64"
							keyboardShouldPersistTaps="handled"
						>
							<View className="gap-1">
								<TouchableOpacity
									onPress={handleRemoveCategory}
									activeOpacity={0.7}
									className={cn(
										"flex-row items-center gap-3 rounded-lg px-3 py-2.5",
										currentCategoryId === null && "bg-primary/10",
									)}
								>
									<View className="size-8 items-center justify-center rounded-full bg-muted">
										<Icon
											as={Ban}
											className="text-muted-foreground"
											size={16}
										/>
									</View>
									<Text
										className={cn(
											"flex-1 text-sm",
											currentCategoryId === null && "font-medium text-primary",
										)}
									>
										Brak kategorii
									</Text>
								</TouchableOpacity>

								{filteredCategories.map((category) => {
									const CategoryIconComponent = getCategoryIcon(category.icon);
									const isSelected = currentCategoryId === category.id;
									const canShowActions = category.type === "local";

									return (
										<TouchableOpacity
											key={category.id}
											onPress={() => handleSelectCategory(category)}
											onLongPress={() => {
												if (canShowActions) {
													handleLongPressCategory(category);
												}
											}}
											delayLongPress={300}
											activeOpacity={0.7}
											className={cn(
												"flex-row items-center gap-3 rounded-lg px-3 py-2.5",
												isSelected && "bg-primary/10",
											)}
										>
											<View className="size-8 items-center justify-center rounded-full bg-primary/10">
												<Icon
													as={CategoryIconComponent}
													className="text-primary"
													size={16}
												/>
											</View>
											<View className="flex-1">
												<Text
													className={cn(
														"text-sm",
														isSelected && "font-medium text-primary",
													)}
												>
													{category.name}
												</Text>
												{category.type === "local" && (
													<Text className="text-xs text-muted-foreground">
														{category.authorName
															? `Stworzona przez ${category.authorName}`
															: "Stworzona przez Gościa"}
													</Text>
												)}
												{category.type === "local" &&
													category.hasInDictionary && (
														<Text className="text-xs text-primary">
															Masz już tę kategorię w swoim słowniku
														</Text>
													)}
											</View>
										</TouchableOpacity>
									);
								})}

								{showCreateOption && (
									<TouchableOpacity
										onPress={handleStartCreating}
										activeOpacity={0.7}
										className="flex-row items-center gap-3 rounded-lg border border-dashed border-border px-3 py-2.5"
									>
										<View className="size-8 items-center justify-center rounded-full bg-primary/10">
											<Icon as={Plus} className="text-primary" size={16} />
										</View>
										<Text className="flex-1 text-sm text-primary">
											Utwórz kategorię: "{debouncedQuery}"
										</Text>
									</TouchableOpacity>
								)}
							</View>
						</ScrollView>
					</>
				) : (
					<ScrollView className="max-h-80">
						<View className="gap-4">
							<View className="gap-2">
								<Label>Nazwa kategorii</Label>
								<Input
									placeholder="np. Artykuły biurowe"
									value={newCategoryName}
									onChangeText={(text) => {
										setNewCategoryName(text);
										if (nameError) setNameError("");
									}}
									editable={!isCreating}
									maxLength={MAX_CATEGORY_NAME_LENGTH}
									autoFocus
								/>
								{nameError ? (
									<Text className="text-sm text-destructive">{nameError}</Text>
								) : null}
							</View>

							<View className="gap-2">
								<Label>Ikona</Label>
								<IconPicker
									selectedIcon={newCategoryIcon}
									onSelectIcon={setNewCategoryIcon}
								/>
							</View>
						</View>
					</ScrollView>
				)}

				<DialogFooter>
					{!isCreatingNew ? (
						<Button variant="outline" onPress={handleClose}>
							<Text>Anuluj</Text>
						</Button>
					) : (
						<>
							<Button
								variant="outline"
								onPress={handleCancelCreating}
								disabled={isCreating}
							>
								<Text>Wstecz</Text>
							</Button>
							<Button
								onPress={handleCreateAndAssign}
								disabled={!newCategoryName.trim() || isCreating}
							>
								<Text>{isCreating ? "Tworzenie..." : "Utwórz i przypisz"}</Text>
							</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>

			{actionDialogCategory && (
				<Dialog
					open={!!actionDialogCategory}
					onOpenChange={handleCloseActionDialog}
				>
					<DialogContent variant="centered">
						<DialogHeader>
							<DialogTitle>{actionDialogCategory.name}</DialogTitle>
							<DialogDescription>
								Wybierz akcję dla tej kategorii
							</DialogDescription>
						</DialogHeader>

						<View className="gap-2">
							{actionDialogCategory.type === "local" &&
								!actionDialogCategory.hasInDictionary && (
									<Button onPress={handleAddToDictionary}>
										<Text>Dodaj kategorię do słownika</Text>
									</Button>
								)}
							{actionDialogCategory.type === "local" && (
								<Button variant="destructive" onPress={handleDeleteLocal}>
									<Text>Usuń kategorię lokalną</Text>
								</Button>
							)}
						</View>

						<DialogFooter>
							<Button variant="outline" onPress={handleCloseActionDialog}>
								<Text>Anuluj</Text>
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</Dialog>
	);
}
