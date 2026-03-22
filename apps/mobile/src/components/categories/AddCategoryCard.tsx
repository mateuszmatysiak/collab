import { Plus } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { useCreateUserCategory } from "@/api/categories.api";
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
import {
	MAX_CATEGORY_NAME_LENGTH,
	MIN_CATEGORY_NAME_LENGTH,
} from "@/lib/constants";
import { IconPicker, POPULAR_ICONS } from "./IconPicker";

interface AddCategoryCardProps {
	width: number;
}

export function AddCategoryCard(props: AddCategoryCardProps) {
	const { width } = props;

	const [isOpen, setIsOpen] = useState(false);
	const [name, setName] = useState("");
	const [icon, setIcon] = useState<string>(POPULAR_ICONS[0]);
	const [nameError, setNameError] = useState("");

	const { mutate: createCategory, isPending } = useCreateUserCategory();

	function handleCreate() {
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

		createCategory(
			{ name: trimmedName, icon },
			{
				onSuccess: () => {
					setName("");
					setIcon(POPULAR_ICONS[0]);
					setIsOpen(false);
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
		setName("");
		setIcon(POPULAR_ICONS[0]);
		setNameError("");
		setIsOpen(false);
	}

	function handleChangeName(text: string) {
		setName(text);
		if (nameError) setNameError("");
	}

	return (
		<>
			<Pressable
				onPress={() => setIsOpen(true)}
				className="m-1 aspect-square"
				style={{ width }}
			>
				<View className="flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-border p-3">
					<View className="mb-2 size-12 items-center justify-center rounded-xl bg-muted">
						<Icon as={Plus} className="text-muted-foreground" size={24} />
					</View>
					<Text className="text-center text-sm font-semibold text-muted-foreground">
						Dodaj kategorię
					</Text>
				</View>
			</Pressable>

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Nowa kategoria</DialogTitle>
						<DialogDescription>
							Utwórz własną kategorię w swoim słowniku.
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
						<Button
							variant="outline"
							onPress={handleClose}
							disabled={isPending}
						>
							<Text>Anuluj</Text>
						</Button>
						<Button onPress={handleCreate} disabled={!name.trim() || isPending}>
							<Text>{isPending ? "Tworzenie..." : "Utwórz"}</Text>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
