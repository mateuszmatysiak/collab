import type { Category } from "@collab-list/shared/types";
import { useState } from "react";
import { Alert, View } from "react-native";
import { useUpdateUserCategory } from "@/api/categories.api";
import { Button } from "@/components/ui/Button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Text } from "@/components/ui/Text";
import {
	MAX_CATEGORY_NAME_LENGTH,
	MIN_CATEGORY_NAME_LENGTH,
} from "@/lib/constants";
import { IconPicker } from "./IconPicker";

interface EditCategoryDialogProps {
	category: Category;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditCategoryDialog(props: EditCategoryDialogProps) {
	const { category, isOpen, onOpenChange } = props;

	const [name, setName] = useState(category.name);
	const [icon, setIcon] = useState(category.icon);
	const [nameError, setNameError] = useState("");

	const { mutate: updateCategory, isPending } = useUpdateUserCategory(
		category.id,
	);

	function handleOpenChange(open: boolean) {
		if (open) {
			setName(category.name);
			setIcon(category.icon);
			setNameError("");
		}
		onOpenChange(open);
	}

	function handleSave() {
		const trimmedName = name.trim();

		if (!trimmedName || trimmedName.length < MIN_CATEGORY_NAME_LENGTH) {
			setNameError("Nazwa kategorii jest wymagana");
			return;
		}

		if (trimmedName.length > MAX_CATEGORY_NAME_LENGTH) {
			setNameError(
				`Nazwa może mieć maksymalnie ${MAX_CATEGORY_NAME_LENGTH} znaków`,
			);
			return;
		}

		setNameError("");

		updateCategory(
			{ name: trimmedName, icon },
			{
				onSuccess: () => {
					onOpenChange(false);
				},
				onError: () => {
					Alert.alert(
						"Błąd",
						"Nie udało się zaktualizować kategorii. Spróbuj ponownie.",
					);
				},
			},
		);
	}

	function handleClose() {
		setName(category.name);
		setIcon(category.icon);
		setNameError("");
		onOpenChange(false);
	}

	function handleChangeName(text: string) {
		setName(text);
		if (nameError) setNameError("");
	}

	const hasChanges = name.trim() !== category.name || icon !== category.icon;

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edytuj kategorię</DialogTitle>
					<DialogDescription>
						Zmień nazwę lub ikonę kategorii.
					</DialogDescription>
				</DialogHeader>

				<View className="gap-4">
					<View className="gap-2">
						<Label>Nazwa kategorii</Label>
						<Input
							placeholder="np. Artykuły biurowe"
							value={name}
							onChangeText={handleChangeName}
							editable={!isPending}
							maxLength={MAX_CATEGORY_NAME_LENGTH}
						/>
						{nameError ? (
							<Text className="text-sm text-destructive">{nameError}</Text>
						) : null}
					</View>

					<View className="gap-2">
						<Label>Ikona</Label>
						<IconPicker selectedIcon={icon} onSelectIcon={setIcon} />
					</View>
				</View>

				<DialogFooter>
					<Button variant="outline" onPress={handleClose} disabled={isPending}>
						<Text>Anuluj</Text>
					</Button>
					<Button
						onPress={handleSave}
						disabled={!name.trim() || !hasChanges || isPending}
					>
						<Text>{isPending ? "Zapisywanie..." : "Zapisz"}</Text>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
