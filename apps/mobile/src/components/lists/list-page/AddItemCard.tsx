import type { CategoryType } from "@collab-list/shared/types";
import { Ban, GripVertical, Plus } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, type TextInput, View } from "react-native";
import { useListCategories } from "@/api/categories.api";
import { useCreateItem } from "@/api/items.api";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { UNCATEGORIZED_FILTER } from "@/lib/constants";
import { getCategoryIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { CategorySelectDialog } from "./CategorySelectDialog";

interface AddItemCardProps {
	listId: string;
	filterCategoryId?: string | null;
	filterCategoryType?: CategoryType | null;
}

export function AddItemCard(props: AddItemCardProps) {
	const { listId, filterCategoryId = null, filterCategoryType = null } = props;

	const titleInputRef = useRef<TextInput>(null);
	const descriptionInputRef = useRef<TextInput>(null);
	const isCreatingRef = useRef(false);

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [categoryId, setCategoryId] = useState<string | null>(null);
	const [categoryType, setCategoryType] = useState<CategoryType | null>(null);
	const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

	const { mutate: createItem, isPending } = useCreateItem(listId);
	const { data: categories = [] } = useListCategories(listId);

	useEffect(() => {
		if (
			filterCategoryId &&
			filterCategoryId !== UNCATEGORIZED_FILTER &&
			filterCategoryType
		) {
			setCategoryId(filterCategoryId);
			setCategoryType(filterCategoryType);
		} else {
			setCategoryId(null);
			setCategoryType(null);
		}
	}, [filterCategoryId, filterCategoryType]);

	const selectedCategory = useMemo(() => {
		if (!categoryId) return null;
		return categories.find((cat) => cat.id === categoryId) ?? null;
	}, [categoryId, categories]);

	const CategoryIconComponent = selectedCategory
		? getCategoryIcon(selectedCategory.icon)
		: null;

	const resetForm = useCallback(() => {
		setTitle("");
		setDescription("");
		setCategoryId(null);
		setCategoryType(null);
	}, []);

	const handleCreate = useCallback(() => {
		if (isPending || isCreatingRef.current) return;

		const trimmedTitle = title.trim();
		if (!trimmedTitle) return;

		isCreatingRef.current = true;

		createItem(
			{
				title: trimmedTitle,
				description: description.trim() || undefined,
				categoryId,
				categoryType,
			},
			{
				onSuccess: () => {
					resetForm();
					isCreatingRef.current = false;
					setTimeout(() => {
						titleInputRef.current?.focus();
					}, 50);
				},
				onError: () => {
					isCreatingRef.current = false;
					Alert.alert(
						"Błąd",
						"Nie udało się dodać elementu. Spróbuj ponownie.",
					);
				},
			},
		);
	}, [
		createItem,
		isPending,
		title,
		description,
		categoryId,
		categoryType,
		resetForm,
	]);

	const handleTitleSubmit = useCallback(() => {
		descriptionInputRef.current?.focus();
	}, []);

	const handleCategorySelect = useCallback(
		(id: string | null, type: CategoryType | null) => {
			setCategoryId(id);
			setCategoryType(type);
		},
		[],
	);

	const canSubmit = title.trim().length > 0 && !isPending;

	return (
		<Card className="flex-row items-center gap-3 px-4 py-3">
			<View className="size-8 items-center justify-center">
				<Icon
					as={GripVertical}
					className="text-muted-foreground/30"
					size={18}
				/>
			</View>

			<Checkbox checked={false} onCheckedChange={() => {}} disabled />

			<Pressable
				onPress={() => setIsCategoryDialogOpen(true)}
				className={cn(
					"size-8 items-center justify-center rounded-full",
					CategoryIconComponent ? "bg-primary/10" : "bg-muted",
				)}
				hitSlop={4}
			>
				<Icon
					as={CategoryIconComponent ?? Ban}
					className={
						CategoryIconComponent ? "text-primary" : "text-muted-foreground"
					}
					size={16}
				/>
			</Pressable>

			<View className="flex-1 gap-1">
				<Input
					ref={titleInputRef}
					value={title}
					onChangeText={setTitle}
					onSubmitEditing={handleTitleSubmit}
					placeholder="Tytuł elementu..."
					editable={!isPending}
					returnKeyType="next"
					className="h-auto min-h-0 border-0 bg-transparent dark:bg-transparent p-0 py-0 shadow-none text-base font-medium text-foreground"
				/>

				<Input
					ref={descriptionInputRef}
					value={description}
					onChangeText={setDescription}
					onSubmitEditing={handleCreate}
					placeholder="Dodatkowy opis..."
					editable={!isPending}
					returnKeyType="done"
					className="h-auto min-h-0 border-0 bg-transparent dark:bg-transparent p-0 py-0 shadow-none text-sm text-muted-foreground"
					textAlignVertical="top"
				/>
			</View>

			<Pressable
				onPress={handleCreate}
				disabled={!canSubmit}
				className="size-8 items-center justify-center rounded-full active:bg-primary/20"
				hitSlop={8}
			>
				<Icon
					as={Plus}
					className={canSubmit ? "text-primary" : "text-muted-foreground/50"}
					size={18}
				/>
			</Pressable>

			<CategorySelectDialog
				listId={listId}
				isOpen={isCategoryDialogOpen}
				onOpenChange={setIsCategoryDialogOpen}
				currentCategoryId={categoryId}
				onSelectCategory={handleCategorySelect}
			/>
		</Card>
	);
}
