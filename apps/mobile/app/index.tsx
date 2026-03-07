import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/contexts/auth.context";

export default function Index() {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<ActivityIndicator size="large" />
			</View>
		);
	}

	if (isAuthenticated) {
		return <Redirect href="/(tabs)/lists" />;
	}

	return <Redirect href="/(auth)/login" />;
}
