import { Search } from "lucide-react-native";
import { View } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";

interface CategorySearchInputProps {
	value: string;
	onChangeText: (text: string) => void;
}

export function CategorySearchInput(props: CategorySearchInputProps) {
	const { value, onChangeText } = props;

	return (
		<View className="relative">
			<View className="absolute left-4 top-0 bottom-0 z-10 justify-center">
				<Icon as={Search} className="text-muted-foreground" size={18} />
			</View>
			<Input
				placeholder="Szukaj kategorii..."
				value={value}
				onChangeText={onChangeText}
				className="pl-11"
			/>
		</View>
	);
}
