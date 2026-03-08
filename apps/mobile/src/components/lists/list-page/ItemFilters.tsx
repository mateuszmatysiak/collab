import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/Text";

export type ItemFilter = "all" | "completed" | "incomplete";

const FILTER_ITEMS: { value: ItemFilter; label: string }[] = [
	{ value: "all", label: "Wszystkie" },
	{ value: "incomplete", label: "Aktywne" },
	{ value: "completed", label: "Ukończone" },
];

interface ItemFiltersProps {
	filter: ItemFilter;
	onFilterChange: (filter: ItemFilter) => void;
}

export function ItemFilters(props: ItemFiltersProps) {
	const { filter, onFilterChange } = props;

	return (
		<View className="px-6 pb-3">
			<View className="flex-row rounded-lg border border-border bg-muted/50 p-1">
				{FILTER_ITEMS.map((filterItem) => {
					const isActive = filter === filterItem.value;
					return (
						<Pressable
							key={filterItem.value}
							onPress={() =>
								onFilterChange(
									filter === filterItem.value && filterItem.value !== "all"
										? "all"
										: filterItem.value,
								)
							}
							style={{
								flex: 1,
								alignItems: "center",
								borderRadius: 6,
								paddingVertical: 6,
								backgroundColor: isActive ? "rgb(var(--background))" : "transparent",
								shadowColor: isActive ? "#000" : "transparent",
								shadowOffset: { width: 0, height: 1 },
								shadowOpacity: isActive ? 0.05 : 0,
								shadowRadius: 1,
								elevation: isActive ? 1 : 0,
							}}
						>
							<Text
								style={{
									fontSize: 14,
									fontWeight: isActive ? "500" : "400",
									color: isActive
										? "rgb(var(--foreground))"
										: "rgb(var(--muted-foreground))",
								}}
							>
								{filterItem.label}
							</Text>
						</Pressable>
					);
				})}
			</View>
		</View>
	);
}
