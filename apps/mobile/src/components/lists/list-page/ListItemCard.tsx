import type { CategoryType, ListItem } from "@collab-list/shared/types";
import { Ban, GripVertical, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Pressable, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { useDeleteItem, useUpdateItem } from "@/api/items.api";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { getCategoryIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { CategorySelectDialog } from "./CategorySelectDialog";

const ANIMATION_DURATION = 300;

interface ListItemCardProps {
	item: ListItem;
	listId: string;
	isActive?: boolean;
	onDragStart?: () => void;
	onDragEnd?: () => void;
	onInputFocus?: () => void;
}

export function ListItemCard(props: ListItemCardProps) {
	const { item, listId, isActive, onDragStart, onDragEnd, onInputFocus } =
		props;

	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const [isEditingDescription, setIsEditingDescription] = useState(false);
	const [editingTitle, setEditingTitle] = useState(item.title);
	const [editingDescription, setEditingDescription] = useState(
		item.description ?? "",
	);
	const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

	const { mutate: updateItem } = useUpdateItem(listId, item.id);
	const { mutate: deleteItem } = useDeleteItem(listId, item.id);

	const opacity = useSharedValue(item.isCompleted ? 0.6 : 1);
	const scale = useSharedValue(1);

	useEffect(() => {
		opacity.value = withTiming(item.isCompleted ? 0.6 : 1, {
			duration: ANIMATION_DURATION,
		});
	}, [item.isCompleted, opacity]);

	const animatedCardStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
	}));

	const animatedCheckboxStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	function handleCheckboxChange(checked: boolean) {
		scale.value = withTiming(1.2, { duration: 100 }, () => {
			scale.value = withTiming(1, { duration: 100 });
		});

		updateItem(
			{ is_completed: checked },
			{
				onError: () => {
					Alert.alert("Błąd", "Nie udało się zaktualizować elementu.");
				},
			},
		);
	}

	function handleTitlePress() {
		setIsEditingTitle(true);
		setEditingTitle(item.title);
	}

	function handleDescriptionPress() {
		setIsEditingDescription(true);
		setEditingDescription(item.description || "");
	}

	function handleTitleBlur() {
		const trimmedTitle = editingTitle.trim();

		if (trimmedTitle && trimmedTitle !== item.title) {
			updateItem({ title: trimmedTitle });
		} else {
			setEditingTitle(item.title);
		}
		setIsEditingTitle(false);
	}

	function handleDescriptionBlur() {
		const trimmedDescription = editingDescription.trim();
		if (trimmedDescription !== (item.description ?? "")) {
			updateItem({ description: trimmedDescription });
		} else {
			setEditingDescription(item.description ?? "");
		}
		setIsEditingDescription(false);
	}

	function handleCategorySelect(
		categoryId: string | null,
		categoryType: CategoryType | null,
	) {
		updateItem(
			{ categoryId, categoryType },
			{
				onError: () => {
					Alert.alert("Błąd", "Nie udało się zaktualizować kategorii.");
				},
			},
		);
	}

	const CategoryIconComponent = item.categoryIcon
		? getCategoryIcon(item.categoryIcon)
		: null;

	return (
		<Animated.View style={animatedCardStyle}>
			<Card
				className={cn(
					"flex-row items-center gap-3 px-4 py-3",
					item.isCompleted && "bg-muted",
					isActive && "opacity-90 shadow-lg",
				)}
			>
				<Pressable
					onPressIn={onDragStart}
					onPressOut={onDragEnd}
					className="size-8 items-center justify-center"
					hitSlop={8}
				>
					<Icon as={GripVertical} className="text-muted-foreground" size={18} />
				</Pressable>

				<Animated.View style={animatedCheckboxStyle}>
					<Checkbox
						checked={item.isCompleted}
						onCheckedChange={handleCheckboxChange}
					/>
				</Animated.View>

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
					{isEditingTitle ? (
						<Input
							value={editingTitle}
							onChangeText={setEditingTitle}
							onFocus={onInputFocus}
							onBlur={handleTitleBlur}
							autoFocus
							placeholder="Tytuł elementu..."
							className={cn(
								"h-auto min-h-0 border-0 p-0 py-0 shadow-none",
								item.isCompleted
									? "bg-muted dark:bg-muted"
									: "bg-card dark:bg-card",
								"text-base font-medium text-foreground",
								item.isCompleted && "line-through text-muted-foreground",
							)}
						/>
					) : (
						<Pressable onPress={handleTitlePress}>
							<Text
								className={cn(
									"text-base font-medium",
									item.isCompleted && "line-through text-muted-foreground",
									!item.title && "text-muted-foreground",
								)}
							>
								{item.title || "Tytuł elementu..."}
							</Text>
						</Pressable>
					)}

					{isEditingDescription ? (
						<Input
							value={editingDescription}
							onChangeText={setEditingDescription}
							onFocus={onInputFocus}
							onBlur={handleDescriptionBlur}
							autoFocus
							placeholder="Dodatkowy opis..."
							className={cn(
								"h-auto min-h-0 border-0 p-0 py-0 shadow-none text-sm text-muted-foreground",
								item.isCompleted
									? "bg-muted dark:bg-muted"
									: "bg-card dark:bg-card",
							)}
							textAlignVertical="top"
						/>
					) : (
						<Pressable onPress={handleDescriptionPress}>
							<Text className="text-sm text-muted-foreground">
								{item.description || "Dodatkowy opis..."}
							</Text>
						</Pressable>
					)}
				</View>

				<Pressable
					onPress={() =>
						deleteItem(undefined, {
							onError: () => {
								Alert.alert("Błąd", "Nie udało się usunąć elementu.");
							},
						})
					}
					className="size-8 items-center justify-center rounded-full active:bg-destructive/20"
					hitSlop={8}
				>
					<Icon as={X} className="text-destructive" size={18} />
				</Pressable>

				<CategorySelectDialog
					listId={listId}
					isOpen={isCategoryDialogOpen}
					onOpenChange={setIsCategoryDialogOpen}
					currentCategoryId={item.categoryId}
					onSelectCategory={handleCategorySelect}
				/>
			</Card>
		</Animated.View>
	);
}
