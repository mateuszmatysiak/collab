import { View } from "react-native";
import { GlassSelect } from "@/components/ui/GlassSelect";

export type ItemFilter = "all" | "completed" | "incomplete";

const FILTER_OPTIONS: { value: ItemFilter; label: string }[] = [
	{ value: "all", label: "Wszystkie" },
	{ value: "incomplete", label: "Aktywne" },
	{ value: "completed", label: "Ukończone" },
];

interface ItemFiltersProps {
	filter: ItemFilter;
	onFilterChange: (filter: ItemFilter) => void;
	compact?: boolean;
}

export function ItemFilters(props: ItemFiltersProps) {
	const { filter, onFilterChange, compact = false } = props;

	if (compact) {
		return (
			<GlassSelect
				options={FILTER_OPTIONS}
				value={filter}
				onValueChange={onFilterChange}
				placeholder="Status"
			/>
		);
	}

	return (
		<View className="px-6 pb-3">
			<GlassSelect
				options={FILTER_OPTIONS}
				value={filter}
				onValueChange={onFilterChange}
				placeholder="Status"
			/>
		</View>
	);
}
