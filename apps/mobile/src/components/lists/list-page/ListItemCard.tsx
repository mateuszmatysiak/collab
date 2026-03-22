import type { CategoryType, ListItem } from "@collab-list/shared/types";
import { Ban, GripVertical, X } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useDerivedValue,
	useSharedValue,
	withSpring,
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

	const checkboxScale = useSharedValue(1);
	const cardOpacity = useDerivedValue(() =>
		withTiming(item.isCompleted ? 0.55 : 1, { duration: ANIMATION_DURATION }),
	);

	const animatedContainerStyle = useAnimatedStyle(() => ({
		opacity: cardOpacity.value,
		marginBottom: 12,
	}));

	const animatedCheckboxStyle = useAnimatedStyle(() => ({
		transform: [{ scale: checkboxScale.value }],
	}));

	function handleCheckboxChange(checked: boolean) {
		checkboxScale.value = withSpring(
			0.8,
			{ damping: 15, stiffness: 400 },
			() => {
				checkboxScale.value = withSpring(1, { damping: 10, stiffness: 300 });
			},
		);

		doUpdate(checked);
	}

	function doUpdate(checked: boolean) {
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
		<Animated.View style={animatedContainerStyle}>
			<Card
				className={cn(
					"flex-row items-start gap-3 rounded-2xl border border-border bg-card px-4 py-3",
					item.isCompleted && "bg-muted/50",
					isActive && "opacity-90 shadow-lg shadow-black/10",
				)}
			>
				<Pressable
					onPressIn={onDragStart}
					onPressOut={onDragEnd}
					className="mt-0.5 size-8 items-center justify-center"
					hitSlop={8}
				>
					<Icon as={GripVertical} className="text-muted-foreground" size={18} />
				</Pressable>

				<Animated.View style={animatedCheckboxStyle} className="mt-1.5">
					<Checkbox
						checked={item.isCompleted}
						onCheckedChange={handleCheckboxChange}
					/>
				</Animated.View>

				<Pressable
					onPress={() => setIsCategoryDialogOpen(true)}
					className={cn(
						"mt-0.5 size-8 items-center justify-center rounded-full",
						CategoryIconComponent ? "bg-muted" : "bg-muted",
					)}
					hitSlop={4}
				>
					<Icon
						as={CategoryIconComponent ?? Ban}
						className={
							CategoryIconComponent
								? "text-foreground"
								: "text-muted-foreground"
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
							onPressIn={onInputFocus}
							onBlur={handleTitleBlur}
							autoFocus
							placeholder="Tytuł elementu..."
							className={cn(
								"h-auto min-h-0 border-0 p-0 py-1 shadow-none",
								item.isCompleted
									? "bg-muted dark:bg-muted"
									: "bg-card dark:bg-card",
								"text-base font-medium text-foreground",
								item.isCompleted && "line-through text-muted-foreground",
							)}
						/>
					) : (
						<Pressable
							onPress={handleTitlePress}
							className="min-h-[28px] justify-center"
						>
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
							onPressIn={onInputFocus}
							onBlur={handleDescriptionBlur}
							autoFocus
							placeholder="Dodatkowy opis..."
							className={cn(
								"h-auto min-h-0 border-0 p-0 py-1 shadow-none text-sm",
								item.isCompleted
									? "bg-muted dark:bg-muted"
									: "bg-card dark:bg-card",
								editingDescription
									? "text-foreground"
									: "text-muted-foreground",
							)}
							textAlignVertical="top"
						/>
					) : (
						<Pressable
							onPress={handleDescriptionPress}
							className="min-h-[24px] justify-center"
						>
							<Text
								className={cn(
									"text-sm",
									item.description
										? "text-foreground"
										: "text-muted-foreground",
								)}
							>
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
					className="mt-0.5 size-8 items-center justify-center rounded-full active:bg-destructive/20"
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
