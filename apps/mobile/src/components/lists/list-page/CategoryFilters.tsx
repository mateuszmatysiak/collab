import type { LucideIcon } from "lucide-react-native";
import { Ban, Layers } from "lucide-react-native";
import { useMemo } from "react";
import { View } from "react-native";
import { useListCategories } from "@/api/categories.api";
import { useItems } from "@/api/items.api";
import { GlassSelect } from "@/components/ui/GlassSelect";
import { UNCATEGORIZED_FILTER } from "@/lib/constants";
import { getCategoryIcon } from "@/lib/icons";

interface CategoryFiltersProps {
	listId: string;
	selectedCategoryId: string | null;
	onCategoryChange: (
		categoryId: string | null,
		categoryType: string | null,
	) => void;
	compact?: boolean;
}

export function CategoryFilters(props: CategoryFiltersProps) {
	const {
		listId,
		selectedCategoryId,
		onCategoryChange,
		compact = false,
	} = props;

	const { data: items } = useItems(listId);
	const { data: allCategories } = useListCategories(listId);

	const availableCategories = useMemo(() => {
		if (!items || !allCategories) return [];

		const uniqueCategoryIds = new Set<string>();
		for (const item of items) {
			if (item.categoryId) {
				uniqueCategoryIds.add(item.categoryId);
			}
		}

		return allCategories.filter((category) =>
			uniqueCategoryIds.has(category.id),
		);
	}, [items, allCategories]);

	const hasUncategorizedItems = useMemo(() => {
		if (!items) return false;
		return items.some((item) => item.categoryId === null);
	}, [items]);

	const options = useMemo(() => {
		const opts: { value: string; label: string; icon?: LucideIcon }[] = [
			{ value: "__all__", label: "Wszystkie", icon: Layers },
		];
		if (hasUncategorizedItems && availableCategories.length > 0) {
			opts.push({
				value: UNCATEGORIZED_FILTER,
				label: "Brak kategorii",
				icon: Ban,
			});
		}
		for (const cat of availableCategories) {
			opts.push({
				value: cat.id,
				label: cat.name,
				icon: getCategoryIcon(cat.icon),
			});
		}
		return opts;
	}, [availableCategories, hasUncategorizedItems]);

	const currentValue = selectedCategoryId ?? "__all__";

	function handleChange(value: string) {
		if (value === "__all__") {
			onCategoryChange(null, null);
			return;
		}
		if (value === UNCATEGORIZED_FILTER) {
			onCategoryChange(UNCATEGORIZED_FILTER, null);
			return;
		}
		const category = availableCategories.find((c) => c.id === value);
		onCategoryChange(value, category?.type ?? null);
	}

	if (compact) {
		return (
			<GlassSelect
				options={options}
				value={currentValue}
				onValueChange={handleChange}
				placeholder="Kategoria"
			/>
		);
	}

	return (
		<View className="px-6 pb-4">
			<GlassSelect
				options={options}
				value={currentValue}
				onValueChange={handleChange}
				placeholder="Kategoria"
			/>
		</View>
	);
}
