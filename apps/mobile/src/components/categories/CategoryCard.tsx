import type { Category } from "@collab-list/shared/types";
import { X } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";
import { getCategoryIcon } from "@/lib/icons";
import { DeleteCategoryDialog } from "./DeleteCategoryDialog";
import { EditCategoryDialog } from "./EditCategoryDialog";

interface CategoryCardProps {
	category: Category;
	width: number;
}

export function CategoryCard(props: CategoryCardProps) {
	const { category, width } = props;
	const IconComponent = getCategoryIcon(category.icon);

	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	function handlePress() {
		setIsEditOpen(true);
	}

	function handleLongPress() {
		Alert.alert(category.name, "Wybierz akcję", [
			{
				text: "Edytuj",
				onPress: () => setIsEditOpen(true),
			},
			{
				text: "Usuń",
				onPress: () => setIsDeleteOpen(true),
				style: "destructive",
			},
			{
				text: "Anuluj",
				style: "cancel",
			},
		]);
	}

	function handleDeletePress() {
		setIsDeleteOpen(true);
	}

	return (
		<>
			<View className="m-1 aspect-square" style={{ width }}>
				<Pressable
					onPress={handlePress}
					onLongPress={handleLongPress}
					delayLongPress={300}
					className="flex-1"
				>
					<View className="relative flex-1 items-center justify-center rounded-2xl border border-border bg-card p-3">
						<Pressable
							onPress={(e) => {
								e.stopPropagation();
								handleDeletePress();
							}}
							onStartShouldSetResponder={() => true}
							className="absolute right-0 top-0 z-10 size-8 items-center justify-center rounded-bl-xl rounded-tr-2xl bg-destructive/10 active:bg-destructive/20"
						>
							<Icon as={X} className="text-destructive" size={12} />
						</Pressable>
						<View className="mb-2 size-12 items-center justify-center rounded-xl bg-primary/10">
							<Icon as={IconComponent} className="text-primary" size={24} />
						</View>
						<Text
							className="text-center text-sm font-semibold text-foreground"
							numberOfLines={2}
						>
							{category.name}
						</Text>
					</View>
				</Pressable>
			</View>

			<EditCategoryDialog
				category={category}
				isOpen={isEditOpen}
				onOpenChange={setIsEditOpen}
			/>

			<DeleteCategoryDialog
				category={category}
				isOpen={isDeleteOpen}
				onOpenChange={setIsDeleteOpen}
			/>
		</>
	);
}
