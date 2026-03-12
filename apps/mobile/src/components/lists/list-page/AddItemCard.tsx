import type { CategoryType } from "@collab-list/shared/types";
import { Ban, GripVertical, Plus } from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
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
	onInputFocus?: () => void;
}

export function AddItemCard(props: AddItemCardProps) {
	const {
		listId,
		filterCategoryId = null,
		filterCategoryType = null,
		onInputFocus,
	} = props;

	const titleInputRef = useRef<TextInput>(null);
	const descriptionInputRef = useRef<TextInput>(null);
	const isCreatingRef = useRef(false);

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [_categoryId, setCategoryId] = useState<string | null | undefined>(
		undefined,
	);
	const [_categoryType, setCategoryType] = useState<
		CategoryType | null | undefined
	>(undefined);
	const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

	const { mutate: createItem, isPending } = useCreateItem(listId);
	const { data: categories = [] } = useListCategories(listId);

	const hasFilterCategory =
		filterCategoryId &&
		filterCategoryId !== UNCATEGORIZED_FILTER &&
		filterCategoryType;

	const categoryId =
		_categoryId ?? (hasFilterCategory ? filterCategoryId : null);
	const categoryType =
		_categoryType ?? (hasFilterCategory ? filterCategoryType : null);

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
		setCategoryId(undefined);
		setCategoryType(undefined);
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
						onInputFocus?.();
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
		onInputFocus,
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
		<Card
			className={cn(
				"flex-row items-start gap-3 rounded-2xl border border-dashed border-primary/20 bg-primary/5 px-4 py-3",
			)}
		>
			<Pressable className="mt-0.5 size-8 items-center justify-center" disabled>
				<Icon
					as={GripVertical}
					className="text-muted-foreground/30"
					size={18}
				/>
			</Pressable>

			<View className="mt-1.5 opacity-30">
				<Checkbox checked={false} onCheckedChange={() => {}} disabled />
			</View>

			<Pressable
				onPress={() => setIsCategoryDialogOpen(true)}
				className="mt-0.5 size-8 items-center justify-center rounded-full bg-muted"
				hitSlop={4}
			>
				<Icon
					as={CategoryIconComponent ?? Ban}
					className={
						CategoryIconComponent ? "text-foreground" : "text-muted-foreground"
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
					onFocus={onInputFocus}
					onPressIn={onInputFocus}
					placeholder="Tytuł elementu..."
					editable={!isPending}
					returnKeyType="next"
					className="h-auto min-h-0 border-0 bg-transparent dark:bg-transparent p-0 py-1 shadow-none text-base font-medium text-foreground"
				/>

				<Input
					ref={descriptionInputRef}
					value={description}
					onChangeText={setDescription}
					onSubmitEditing={handleCreate}
					onFocus={onInputFocus}
					onPressIn={onInputFocus}
					placeholder="Dodatkowy opis..."
					editable={!isPending}
					returnKeyType="done"
					className="h-auto min-h-0 border-0 bg-transparent dark:bg-transparent p-0 py-1 shadow-none text-sm text-muted-foreground"
					textAlignVertical="top"
				/>
			</View>

			<Pressable
				onPress={handleCreate}
				disabled={!canSubmit}
				className="mt-0.5 size-8 items-center justify-center rounded-full active:bg-primary/20"
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
