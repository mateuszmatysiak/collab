import { Tabs } from "expo-router";
import { FolderOpen, ListTodo, UserIcon } from "lucide-react-native";
import { useTheme } from "@/contexts/theme.context";

export default function TabLayout() {
	const { theme } = useTheme();
	const isDark = theme === "dark";

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					position: "absolute",
					bottom: 24,
					marginHorizontal: 20,
					height: 64,
					borderRadius: 20,
					borderTopWidth: 0,
					borderWidth: 1.5,
					borderColor: isDark ? "#33415599" : "#ffffff99",
					backgroundColor: isDark ? "#1e293beb" : "#f0f3ffd1",
					shadowColor: isDark ? "#000" : "#4338ca",
					shadowOffset: { width: 0, height: 8 },
					shadowOpacity: isDark ? 0.3 : 0.15,
					shadowRadius: 28,
					elevation: 20,
					paddingBottom: 8,
					paddingTop: 8,
				},
				tabBarActiveTintColor: isDark ? "#3b82f6" : "#1d4ed8",
				tabBarInactiveTintColor: "#94a3b8",
				tabBarLabelStyle: {
					fontSize: 11,
					fontWeight: "600",
				},
			}}
		>
			<Tabs.Screen
				name="lists"
				options={{
					title: "Listy",
					tabBarIcon: ({ color, size }) => (
						<ListTodo color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="categories"
				options={{
					title: "Kategorie",
					tabBarIcon: ({ color, size }) => (
						<FolderOpen color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profil",
					tabBarIcon: ({ color, size }) => (
						<UserIcon color={color} size={size} />
					),
				}}
			/>
		</Tabs>
	);
}
