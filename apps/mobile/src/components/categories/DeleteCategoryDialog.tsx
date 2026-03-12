import type { Category } from "@collab-list/shared/types";
import { Alert } from "react-native";
import { useDeleteUserCategory } from "@/api/categories.api";
import { Button } from "@/components/ui/Button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/Dialog";
import { Text } from "@/components/ui/Text";

interface DeleteCategoryDialogProps {
	category: Category;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}

export function DeleteCategoryDialog(props: DeleteCategoryDialogProps) {
	const { category, isOpen, onOpenChange } = props;

	const { mutate: deleteCategory, isPending } = useDeleteUserCategory(
		category.id,
	);

	function handleDelete() {
		deleteCategory(undefined, {
			onSuccess: () => {
				onOpenChange(false);
			},
			onError: () => {
				Alert.alert(
					"Błąd",
					"Nie udało się usunąć kategorii. Spróbuj ponownie.",
				);
			},
		});
	}

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent variant="centered">
				<DialogHeader>
					<DialogTitle>Usuń kategorię</DialogTitle>
					<DialogDescription>
						Czy na pewno chcesz usunąć kategorię "{category.name}"? Elementy
						list przypisane do tej kategorii zostaną oznaczone jako bez
						kategorii. Tej operacji nie można cofnąć.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant="outline"
						onPress={() => onOpenChange(false)}
						disabled={isPending}
					>
						<Text>Anuluj</Text>
					</Button>
					<Button
						variant="destructive"
						onPress={handleDelete}
						disabled={isPending}
					>
						<Text>{isPending ? "Usuwanie..." : "Usuń"}</Text>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
