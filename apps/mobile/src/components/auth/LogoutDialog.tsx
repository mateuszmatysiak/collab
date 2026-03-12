import { router } from "expo-router";
import { LogOut } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable } from "react-native";
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
import { useAuth } from "@/contexts/auth.context";

interface LogoutDialogProps {
	variant?: "icon" | "button";
}

export function LogoutDialog(props: LogoutDialogProps) {
	const { variant = "icon" } = props;

	const [isLogoutOpen, setIsLogoutOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const { logout } = useAuth();

	async function handleLogout() {
		setIsLoading(true);
		try {
			await logout();
			router.replace("/(auth)/login");
		} catch {
			Alert.alert("Błąd", "Nie udało się wylogować. Spróbuj ponownie.");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<>
			{variant === "icon" ? (
				<Pressable
					onPress={() => setIsLogoutOpen(true)}
					className="size-11 items-center justify-center rounded-xl border border-border bg-card active:bg-muted"
				>
					<Icon as={LogOut} className="text-foreground" size={20} />
				</Pressable>
			) : (
				<Button
					variant="destructive"
					onPress={() => setIsLogoutOpen(true)}
					className="w-full rounded-2xl"
				>
					<Icon as={LogOut} className="text-white" size={20} />
					<Text>Wyloguj</Text>
				</Button>
			)}

			<Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
				<DialogContent variant="centered">
					<DialogHeader>
						<DialogTitle>Wylogowanie</DialogTitle>
						<DialogDescription>
							Czy na pewno chcesz się wylogować?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onPress={() => setIsLogoutOpen(false)}
							disabled={isLoading}
						>
							<Text>Anuluj</Text>
						</Button>
						<Button
							variant="destructive"
							onPress={handleLogout}
							disabled={isLoading}
						>
							<Text>{isLoading ? "Wylogowywanie..." : "Wyloguj"}</Text>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
