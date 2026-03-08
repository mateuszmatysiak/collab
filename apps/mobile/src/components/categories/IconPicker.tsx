import { Search } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { getCategoryIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export const POPULAR_ICONS = [
	// Zakupy / Jedzenie
	"ShoppingCart",
	"ShoppingBag",
	"Store",
	"Milk",
	"Beef",
	"Apple",
	"Carrot",
	"Coffee",
	"Wheat",
	"Candy",
	"IceCream",
	"Pizza",
	"Sandwich",
	"Egg",
	"Fish",
	"Cherry",
	"Grape",
	"Banana",
	"CupSoda",
	"Wine",
	"Beer",
	"Cookie",
	"Salad",
	"Soup",
	// Dom
	"Home",
	"Bed",
	"Bath",
	"Lamp",
	"Sofa",
	"DoorOpen",
	"Key",
	"Lock",
	"Plug",
	"Lightbulb",
	"Trash2",
	"WashingMachine",
	// Transport
	"Car",
	"Bike",
	"Bus",
	"Train",
	"Plane",
	"Ship",
	"Fuel",
	// Praca / Biuro
	"Briefcase",
	"Building2",
	"Monitor",
	"Laptop",
	"Printer",
	"FileText",
	"FolderOpen",
	"Clipboard",
	"PenLine",
	"Calculator",
	// Zdrowie / Sport
	"Heart",
	"Pill",
	"Activity",
	"Dumbbell",
	"Timer",
	"Footprints",
	"Stethoscope",
	// Rozrywka / Hobby
	"Book",
	"BookOpen",
	"Music",
	"Headphones",
	"Gamepad2",
	"Camera",
	"Film",
	"Palette",
	"Paintbrush",
	"Scissors",
	// Ludzie / Rodzina
	"Baby",
	"Dog",
	"Cat",
	"Users",
	"UserPlus",
	"GraduationCap",
	// Natura / Ogród
	"Flower2",
	"TreePine",
	"Sun",
	"Cloud",
	"Droplets",
	"Leaf",
	"Mountain",
	// Inne
	"Star",
	"Gift",
	"Shirt",
	"Package",
	"SprayCan",
	"Wrench",
	"Hammer",
	"Zap",
	"Shield",
	"Flag",
	"Tag",
	"Bookmark",
	"Globe",
	"Phone",
	"Mail",
	"Calendar",
	"Clock",
	"MapPin",
	"Sparkles",
] as const;

interface IconPickerProps {
	selectedIcon: string;
	onSelectIcon: (icon: string) => void;
}

export function IconPicker(props: IconPickerProps) {
	const { selectedIcon, onSelectIcon } = props;
	const [search, setSearch] = useState("");

	const filteredIcons = useMemo(() => {
		if (!search.trim()) return POPULAR_ICONS;
		const query = search.trim().toLowerCase();
		return POPULAR_ICONS.filter((name) => name.toLowerCase().includes(query));
	}, [search]);

	return (
		<View className="gap-2">
			<View
				className="flex-row items-center gap-2 rounded-lg border border-border bg-background px-3"
				pointerEvents="box-none"
			>
				<Icon
					as={Search}
					className="text-muted-foreground"
					pointerEvents="none"
					size={16}
				/>
				<Input
					placeholder="Szukaj ikony..."
					value={search}
					onChangeText={setSearch}
					className="flex-1 border-0 bg-transparent px-0 shadow-none"
				/>
			</View>

			<ScrollView className="max-h-48" keyboardShouldPersistTaps="handled">
				<View className="flex-row flex-wrap gap-2">
					{filteredIcons.map((iconName) => {
						const IconComponent = getCategoryIcon(iconName);
						const isSelected = selectedIcon === iconName;

						return (
							<Pressable
								key={iconName}
								onPress={() => onSelectIcon(iconName)}
								className={cn(
									"size-10 items-center justify-center rounded-lg border",
									isSelected
										? "border-primary bg-primary/10"
										: "border-border bg-background",
								)}
							>
								<Icon
									as={IconComponent}
									className={
										isSelected ? "text-primary" : "text-muted-foreground"
									}
									size={20}
								/>
							</Pressable>
						);
					})}
				</View>
			</ScrollView>
		</View>
	);
}
