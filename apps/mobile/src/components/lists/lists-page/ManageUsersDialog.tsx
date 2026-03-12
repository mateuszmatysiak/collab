import type {
	ListWithDetails,
	SharesAuthor,
	ShareWithUser,
} from "@collab-list/shared/types";
import { UserPlus, X } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useRemoveShare, useShareList, useShares } from "@/api/shares.api";
import { UserAvatar } from "@/components/lists/shared/UserAvatar";
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
import { Text } from "@/components/ui/Text";
import { useIsListOwner } from "@/hooks/useIsListOwner";

interface ManageUsersDialogProps {
	list: ListWithDetails;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function isValidLogin(login: string): boolean {
	return login.trim().length > 0 && login.trim().length <= 255;
}

export function ManageUsersDialog(props: ManageUsersDialogProps) {
	const { list, open, onOpenChange } = props;

	const [login, setLogin] = useState("");
	const [loginError, setLoginError] = useState("");

	const { data: sharesData } = useShares(list.id);
	const shares = sharesData?.shares ?? [];
	const author = sharesData?.author;

	const { mutate: shareList, isPending: isSharing } = useShareList(list.id);

	const isOwner = useIsListOwner(list);

	function handleShare() {
		const trimmedLogin = login.trim();

		if (!trimmedLogin) {
			setLoginError("Login jest wymagany");
			return;
		}

		if (!isValidLogin(trimmedLogin)) {
			setLoginError("Login musi mieć od 1 do 255 znaków");
			return;
		}

		setLoginError("");

		shareList(
			{ login: trimmedLogin },
			{
				onSuccess: () => {
					setLogin("");
				},
				onError: () => {
					Alert.alert(
						"Błąd",
						"Nie udało się udostępnić listy. Sprawdź czy użytkownik istnieje.",
					);
				},
			},
		);
	}

	function handleChangeLogin(text: string) {
		setLogin(text);
		if (loginError) setLoginError("");
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Zarządzaj użytkownikami</DialogTitle>
					<DialogDescription>
						Użytkownicy mający dostęp do listy.
					</DialogDescription>
				</DialogHeader>

				<ScrollView className="max-h-56">
					<View className="gap-2">
						{author && <AuthorItem author={author} />}
						{shares.map((share) => (
							<ShareItem
								key={share.id}
								share={share}
								listId={list.id}
								canRemove={isOwner}
							/>
						))}
					</View>
				</ScrollView>

				{isOwner && (
					<View className="gap-2 pt-2 border-t border-border">
						<Text className="text-sm font-medium">Dodaj użytkownika</Text>
						<View className="flex-row gap-2">
							<Input
								className="flex-1"
								placeholder="Login użytkownika"
								value={login}
								onChangeText={handleChangeLogin}
								editable={!isSharing}
								autoCapitalize="none"
							/>
							<Button
								size="icon"
								onPress={handleShare}
								disabled={!login.trim() || isSharing}
							>
								<Icon
									as={UserPlus}
									className="text-primary-foreground"
									size={18}
								/>
							</Button>
						</View>
						{loginError ? (
							<Text className="text-sm text-destructive">{loginError}</Text>
						) : null}
					</View>
				)}
			</DialogContent>
		</Dialog>
	);
}

interface AuthorItemProps {
	author: SharesAuthor;
}

function AuthorItem(props: AuthorItemProps) {
	const { author } = props;

	return (
		<View className="flex-row items-center gap-3 py-1">
			<UserAvatar name={author.name} />
			<View className="flex-1">
				<View className="flex-row items-center gap-2">
					<Text className="text-sm font-medium">{author.name}</Text>
					<View className="bg-primary/10 px-2 py-0.5 rounded">
						<Text className="text-xs text-primary font-medium">Autor</Text>
					</View>
				</View>
				<Text className="text-xs text-muted-foreground">{author.login}</Text>
			</View>
		</View>
	);
}

interface ShareItemProps {
	share: ShareWithUser;
	listId: string;
	canRemove: boolean;
}

function ShareItem(props: ShareItemProps) {
	const { share, listId, canRemove } = props;

	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	const { mutate: removeShare, isPending } = useRemoveShare(
		listId,
		share.userId,
	);

	function handleRemove() {
		removeShare(undefined, {
			onSuccess: () => {
				setIsDeleteOpen(false);
			},
			onError: () => {
				Alert.alert("Błąd", "Nie udało się usunąć użytkownika.");
			},
		});
	}

	return (
		<>
			<View className="flex-row items-center gap-3 py-1">
				<UserAvatar name={share.userName} />
				<View className="flex-1">
					<Text className="text-sm font-medium">{share.userName}</Text>
					<Text className="text-xs text-muted-foreground">
						{share.userLogin}
					</Text>
				</View>
				{canRemove && (
					<Pressable
						onPress={() => setIsDeleteOpen(true)}
						disabled={isPending}
						className="size-8 items-center justify-center rounded-full active:bg-accent"
						hitSlop={8}
					>
						<Icon
							as={X}
							className={isPending ? "text-muted" : "text-muted-foreground"}
							size={16}
						/>
					</Pressable>
				)}
			</View>
			<Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<DialogContent variant="centered">
					<DialogHeader>
						<DialogTitle>Usuń użytkownika</DialogTitle>
						<DialogDescription>
							Czy na pewno chcesz usunąć {share.userName} z listy?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onPress={() => setIsDeleteOpen(false)}
							disabled={isPending}
						>
							<Text>Anuluj</Text>
						</Button>
						<Button
							variant="destructive"
							onPress={handleRemove}
							disabled={isPending}
						>
							<Text>{isPending ? "Usuwanie..." : "Usuń"}</Text>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
