import { Ban } from "lucide-react-native";
import { useMemo } from "react";
import { ScrollView, View } from "react-native";
import { useListCategories } from "@/api/categories.api";
import { useItems } from "@/api/items.api";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";
import { UNCATEGORIZED_FILTER } from "@/lib/constants";
import { getCategoryIcon } from "@/lib/icons";

interface CategoryFiltersProps {
	listId: string;
	selectedCategoryId: string | null;
	onCategoryChange: (
		categoryId: string | null,
		categoryType: string | null,
	) => void;
}

export function CategoryFilters(props: CategoryFiltersProps) {
	const { listId, selectedCategoryId, onCategoryChange } = props;

	const { data: items } = useItems(listId);
	const { data: allCategories } = useListCategories(listId);

	const availableCategories = useMemo(() => {
		if (!items || !allCategories) return [];

		const uniqueCategoryIds = new Set<string>();
		items.forEach((item) => {
			if (item.categoryId) {
				uniqueCategoryIds.add(item.categoryId);
			}
		});

		return allCategories
			.filter((category) => uniqueCategoryIds.has(category.id))
			.sort((a, b) => a.name.localeCompare(b.name));
	}, [items, allCategories]);

	const hasUncategorizedItems = useMemo(() => {
		if (!items) return false;
		return items.some((item) => item.categoryId === null);
	}, [items]);

	const isUncategorizedSelected = useMemo(() => {
		return selectedCategoryId === UNCATEGORIZED_FILTER;
	}, [selectedCategoryId]);

	if (availableCategories.length === 0 && !hasUncategorizedItems) {
		return null;
	}

	return (
		<View className="px-6 pb-4">
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerClassName="gap-2"
			>
				<Button
					variant={selectedCategoryId === null ? "default" : "outline"}
					size="sm"
					onPress={() => onCategoryChange(null, null)}
				>
					<Text>Wszystkie kategorie</Text>
				</Button>

				{availableCategories.map((category) => {
					const CategoryIconComponent = getCategoryIcon(category.icon);

					const isSelected = selectedCategoryId === category.id;

					return (
						<Button
							key={category.id}
							variant={isSelected ? "default" : "outline"}
							size="sm"
							onPress={() =>
								onCategoryChange(
									isSelected ? null : category.id,
									isSelected ? null : category.type,
								)
							}
							className="flex-row items-center gap-2"
						>
							{CategoryIconComponent && (
								<Icon
									as={CategoryIconComponent}
									className={
										isSelected ? "text-primary-foreground" : "text-foreground"
									}
									size={16}
								/>
							)}
							<Text>{category.name}</Text>
						</Button>
					);
				})}

				{hasUncategorizedItems && availableCategories.length > 0 && (
					<Button
						variant={isUncategorizedSelected ? "default" : "outline"}
						size="sm"
						onPress={() =>
							onCategoryChange(
								isUncategorizedSelected ? null : UNCATEGORIZED_FILTER,
								null,
							)
						}
					>
						<Icon
							as={Ban}
							className={
								isUncategorizedSelected
									? "text-primary-foreground"
									: "text-foreground"
							}
							size={16}
						/>
						<Text>Pozostałe kategorie</Text>
					</Button>
				)}
			</ScrollView>
		</View>
	);
}
