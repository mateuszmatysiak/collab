import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogoutDialog } from "@/components/auth/LogoutDialog";
import { CategoryGrid } from "@/components/categories/CategoryGrid";
import { CategorySearchInput } from "@/components/categories/CategorySearchInput";
import { Text } from "@/components/ui/Text";

export default function CategoriesScreen() {
	const [searchQuery, setSearchQuery] = useState("");

	return (
		<SafeAreaView className="flex-1 bg-background" edges={["top"]}>
			<View className="flex-1">
				<View className="mx-5 mt-3 flex-row items-center px-1 py-4">
					<View className="flex-1">
						<Text className="text-3xl font-bold text-foreground">
							Kategorie
						</Text>
						<Text className="text-sm text-muted-foreground">
							Zarządzaj kategoriami list
						</Text>
					</View>
					<LogoutDialog />
				</View>

				<View className="px-5 pb-4 pt-1">
					<CategorySearchInput
						value={searchQuery}
						onChangeText={setSearchQuery}
					/>
				</View>

				<CategoryGrid searchQuery={searchQuery} />
			</View>
		</SafeAreaView>
	);
}
