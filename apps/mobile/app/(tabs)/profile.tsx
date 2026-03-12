import { ListTodo, Mail, Moon, Users } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLists } from "@/api/lists.api";
import { LogoutDialog } from "@/components/auth/LogoutDialog";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { Switch } from "@/components/ui/Switch";
import { Text } from "@/components/ui/Text";
import { useAuth } from "@/contexts/auth.context";
import { useTheme } from "@/contexts/theme.context";
import { getInitials } from "@/lib/utils";

export default function ProfileScreen() {
	const { user } = useAuth();
	const { data: lists } = useLists();
	const { theme, toggleTheme } = useTheme();

	if (!user) {
		return (
			<SafeAreaView className="flex-1 bg-background" edges={["top"]}>
				<View className="flex-1 items-center justify-center px-6">
					<Text className="text-lg text-muted-foreground">
						Brak danych użytkownika
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	const ownedLists = lists?.filter((list) => list.role === "owner") || [];
	const sharedLists = lists?.filter((list) => list.role !== "owner") || [];
	const initials = getInitials(user.name);

	return (
		<SafeAreaView className="flex-1 bg-background" edges={["top"]}>
			<ScrollView
				className="flex-1"
				contentContainerClassName="px-5 py-6 gap-6 pb-28"
				showsVerticalScrollIndicator={false}
			>
				<View className="items-center gap-4 rounded-2xl border border-border bg-card px-5 py-6">
					<Avatar className="size-28" alt={user.name}>
						<AvatarFallback className="bg-blue-100 dark:bg-blue-500/15">
							<Text className="text-4xl font-semibold text-primary">
								{initials}
							</Text>
						</AvatarFallback>
					</Avatar>

					<View className="items-center gap-1">
						<Text className="text-2xl font-bold text-foreground">
							{user.name}
						</Text>
						{user.name !== user.login && (
							<View className="flex-row items-center gap-2">
								<Icon as={Mail} className="text-muted-foreground" size={16} />
								<Text className="text-muted-foreground">{user.login}</Text>
							</View>
						)}
					</View>
				</View>

				<View className="gap-3">
					<Text className="text-base font-semibold text-foreground">
						Statystyki
					</Text>

					<View className="rounded-2xl border border-border bg-card p-4">
						<View className="flex-row items-center gap-3">
							<View className="size-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/20">
								<Icon as={ListTodo} className="text-primary" size={20} />
							</View>
							<View className="flex-1">
								<Text className="text-2xl font-bold text-foreground">
									{ownedLists.length}
								</Text>
								<Text className="text-sm text-muted-foreground">
									Utworzone listy
								</Text>
							</View>
						</View>
					</View>

					<View className="rounded-2xl border border-border bg-card p-4">
						<View className="flex-row items-center gap-3">
							<View className="size-11 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-500/20">
								<Icon
									as={Users}
									className="text-purple-600 dark:text-purple-400"
									size={20}
								/>
							</View>
							<View className="flex-1">
								<Text className="text-2xl font-bold text-foreground">
									{sharedLists.length}
								</Text>
								<Text className="text-sm text-muted-foreground">
									Udostępnione listy
								</Text>
							</View>
						</View>
					</View>
				</View>

				<View className="gap-3">
					<Text className="text-base font-semibold text-foreground">
						Ustawienia
					</Text>

					<View className="rounded-2xl border border-border bg-card p-4">
						<View className="flex-row items-center gap-3">
							<View className="size-11 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/20">
								<Icon
									as={Moon}
									className="text-indigo-600 dark:text-indigo-400"
									size={20}
								/>
							</View>
							<View className="flex-1">
								<Text className="text-base font-medium text-foreground">
									Tryb ciemny
								</Text>
								<Text className="text-sm text-muted-foreground">
									{theme === "dark" ? "Włączony" : "Wyłączony"}
								</Text>
							</View>
							<Switch value={theme === "dark"} onValueChange={toggleTheme} />
						</View>
					</View>
				</View>

				<LogoutDialog variant="button" />
			</ScrollView>
		</SafeAreaView>
	);
}
