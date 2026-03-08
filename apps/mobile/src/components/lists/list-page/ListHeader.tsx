import type { ListWithDetails } from "@collab-list/shared/types";
import { router } from "expo-router";
import { ArrowLeft, Search, Trash2 } from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import {
	Alert,
	Pressable,
	TextInput,
	type TextInputSubmitEditingEvent,
	View,
} from "react-native";
import { useDeleteList, useUpdateList } from "@/api/lists.api";
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
import { Text } from "@/components/ui/Text";
import { useIsListOwner } from "@/hooks/useIsListOwner";
import { MAX_LIST_NAME_LENGTH } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface EditableListNameProps {
	listName: string;
	onSave: (
		name: string,
		callbacks: { onSuccess: () => void; onError: () => void },
	) => void;
	isUpdating: boolean;
}

function EditableListName(props: EditableListNameProps) {
	const { listName, onSave, isUpdating } = props;

	const [isEditing, setIsEditing] = useState(false);
	const [name, setName] = useState(listName);
	const inputRef = useRef<TextInput>(null);

	function handleStartEditing() {
		setIsEditing(true);
		setTimeout(() => {
			inputRef.current?.focus();
		}, 50);
	}

	function handleSubmitEditing(e: TextInputSubmitEditingEvent) {
		const trimmedName = e.nativeEvent.text.trim();
		handleSave(trimmedName);
	}

	function handleBlur() {
		const trimmedName = name.trim();
		handleSave(trimmedName);
	}

	function handleSave(trimmedName: string) {
		if (!trimmedName || trimmedName === listName) {
			setName(listName);
			setIsEditing(false);
			return;
		}

		onSave(trimmedName, {
			onSuccess: () => setIsEditing(false),
			onError: () => {
				setName(listName);
				setIsEditing(false);
			},
		});
	}

	if (isEditing) {
		return (
			<TextInput
				ref={inputRef}
				className={cn(
					"flex-1 text-xl font-bold text-foreground",
					"border-b border-primary pb-1",
				)}
				value={name}
				onChangeText={setName}
				onSubmitEditing={handleSubmitEditing}
				onBlur={handleBlur}
				editable={!isUpdating}
				maxLength={MAX_LIST_NAME_LENGTH}
				returnKeyType="done"
				selectTextOnFocus
			/>
		);
	}

	return (
		<Pressable
			onPress={handleStartEditing}
			className="flex-1 active:opacity-70"
		>
			<Text className="text-xl font-bold">{listName}</Text>
		</Pressable>
	);
}

interface ListHeaderProps {
	list: ListWithDetails;
	onToggleSearch?: () => void;
	isSearchVisible?: boolean;
}

export function ListHeader(props: ListHeaderProps) {
	const { list, onToggleSearch, isSearchVisible } = props;

	const isOwner = useIsListOwner(list);
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

	const { mutate: updateList, isPending: isUpdating } = useUpdateList(list.id);
	const { mutate: deleteList, isPending: isDeleting } = useDeleteList(list.id);

	const handleGoBack = useCallback(() => {
		router.back();
	}, []);

	function handleSaveName(
		name: string,
		callbacks: { onSuccess: () => void; onError: () => void },
	) {
		updateList(
			{ name },
			{
				onSuccess: callbacks.onSuccess,
				onError: () => {
					Alert.alert("Błąd", "Nie udało się zaktualizować nazwy listy.");
					callbacks.onError();
				},
			},
		);
	}

	function handleDeleteConfirm() {
		setIsDeleteConfirmOpen(true);
	}

	function handleDelete() {
		deleteList(undefined, {
			onSuccess: () => {
				setIsDeleteConfirmOpen(false);
				router.back();
			},
			onError: () => {
				Alert.alert("Błąd", "Nie udało się usunąć listy.");
			},
		});
	}

	return (
		<>
			<View className="flex-row items-center gap-3 px-4 py-3">
				<Pressable
					onPress={handleGoBack}
					className="size-10 items-center justify-center rounded-full active:bg-accent"
					hitSlop={8}
				>
					<Icon as={ArrowLeft} className="text-foreground" size={20} />
				</Pressable>

				<EditableListName
					key={list.name}
					listName={list.name}
					onSave={handleSaveName}
					isUpdating={isUpdating}
				/>

				{onToggleSearch && (
					<Pressable
						onPress={onToggleSearch}
						className={cn(
							"size-10 items-center justify-center rounded-full active:bg-accent",
							isSearchVisible && "bg-primary/10",
						)}
						hitSlop={8}
					>
						<Icon
							as={Search}
							className={isSearchVisible ? "text-primary" : "text-foreground"}
							size={20}
						/>
					</Pressable>
				)}

				{isOwner && (
					<Pressable
						onPress={handleDeleteConfirm}
						className="size-10 items-center justify-center rounded-full active:bg-destructive/10"
						hitSlop={8}
					>
						<Icon as={Trash2} className="text-destructive" size={20} />
					</Pressable>
				)}
			</View>

			<Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Usuń listę</DialogTitle>
						<DialogDescription>
							Czy na pewno chcesz usunąć listę "{list.name}"? Ta operacja jest
							nieodwracalna.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onPress={() => setIsDeleteConfirmOpen(false)}
							disabled={isDeleting}
						>
							<Text>Anuluj</Text>
						</Button>
						<Button
							variant="destructive"
							onPress={handleDelete}
							disabled={isDeleting}
						>
							<Text>{isDeleting ? "Usuwanie..." : "Usuń"}</Text>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
