import { Pressable, ScrollView, View } from "react-native";
import { Text } from "@/components/ui/Text";
import type { ListFilter } from "./ListsContent";

const FILTERS: {
	value: ListFilter;
	label: string;
	activeClass: string;
	activeTextClass: string;
}[] = [
	{
		value: "all",
		label: "Wszystkie",
		activeClass: "bg-slate-700 dark:bg-slate-300",
		activeTextClass: "text-white dark:text-slate-900",
	},
	{
		value: "mine",
		label: "Moje",
		activeClass: "bg-blue-600 dark:bg-blue-500",
		activeTextClass: "text-white",
	},
	{
		value: "shared",
		label: "Udostępnione",
		activeClass: "bg-purple-500 dark:bg-purple-400",
		activeTextClass: "text-white",
	},
];

interface ListFiltersProps {
	filter: ListFilter;
	onFilterChange: (filter: ListFilter) => void;
}

export function ListFilters(props: ListFiltersProps) {
	const { filter, onFilterChange } = props;

	return (
		<View className="px-5 pb-4 pt-1">
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerClassName="gap-2"
			>
				{FILTERS.map((f) => (
					<Pressable
						key={f.value}
						onPress={() => onFilterChange(f.value)}
						className={
							filter === f.value
								? `rounded-full border border-transparent ${f.activeClass} px-5 py-2.5`
								: "rounded-full border border-border bg-card px-5 py-2.5"
						}
					>
						<Text
							className={
								filter === f.value
									? `text-sm font-semibold ${f.activeTextClass}`
									: "text-sm font-medium text-muted-foreground"
							}
						>
							{f.label}
						</Text>
					</Pressable>
				))}
			</ScrollView>
		</View>
	);
}
