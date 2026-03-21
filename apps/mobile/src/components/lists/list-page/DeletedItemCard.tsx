import type { ListItem } from "@collab-list/shared/types";
import { Ban, RotateCcw, X } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { usePermanentlyDeleteItem, useRestoreItem } from "@/api/items.api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
import { getCategoryIcon } from "@/lib/icons";

interface DeletedItemCardProps {
	item: ListItem;
	listId: string;
}

export function DeletedItemCard(props: DeletedItemCardProps) {
	const { item, listId } = props;

	const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

	const { mutate: restoreItem, isPending: isRestoring } = useRestoreItem(
		listId,
		item.id,
	);
	const { mutate: permanentlyDeleteItem, isPending: isDeleting } =
		usePermanentlyDeleteItem(listId, item.id);

	function handleRestore() {
		restoreItem(undefined, {
			onError: () => {
				Alert.alert("Błąd", "Nie udało się przywrócić elementu.");
			},
		});
	}

	function handlePermanentDelete() {
		permanentlyDeleteItem(undefined, {
			onSuccess: () => {
				setIsConfirmDialogOpen(false);
			},
			onError: () => {
				Alert.alert("Błąd", "Nie udało się trwale usunąć elementu.");
			},
		});
	}

	const CategoryIconComponent = item.categoryIcon
		? getCategoryIcon(item.categoryIcon)
		: null;

	return (
		<>
			<View className="mb-3">
				<Card className="flex-row items-center gap-3 rounded-2xl border border-border bg-muted/50 px-4 py-3 opacity-60">
					<Pressable className="size-8 items-center justify-center rounded-full bg-muted">
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
						<Text className="text-base font-medium text-muted-foreground line-through">
							{item.title}
						</Text>
						{item.description ? (
							<Text className="text-sm text-muted-foreground">
								{item.description}
							</Text>
						) : null}
					</View>

					<Pressable
						onPress={handleRestore}
						disabled={isRestoring}
						className="size-8 items-center justify-center rounded-full active:bg-accent"
						hitSlop={8}
					>
						<Icon as={RotateCcw} className="text-muted-foreground" size={16} />
					</Pressable>

					<Pressable
						onPress={() => setIsConfirmDialogOpen(true)}
						disabled={isDeleting}
						className="size-8 items-center justify-center rounded-full active:bg-destructive/20"
						hitSlop={8}
					>
						<Icon as={X} className="text-destructive" size={16} />
					</Pressable>
				</Card>
			</View>

			<Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
				<DialogContent variant="centered">
					<DialogHeader>
						<DialogTitle>Trwałe usunięcie</DialogTitle>
						<DialogDescription>
							Czy na pewno chcesz trwale usunąć ten element? Tej operacji nie
							można cofnąć.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onPress={() => setIsConfirmDialogOpen(false)}
							disabled={isDeleting}
						>
							<Text>Anuluj</Text>
						</Button>
						<Button
							variant="destructive"
							onPress={handlePermanentDelete}
							disabled={isDeleting}
						>
							<Text>{isDeleting ? "Usuwanie..." : "Usuń trwale"}</Text>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
