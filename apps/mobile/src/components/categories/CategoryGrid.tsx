import type { Category } from "@collab-list/shared/types";
import { useEffect, useMemo, useRef } from "react";
import { Animated, FlatList, useWindowDimensions, View } from "react-native";
import { useUserCategories } from "@/api/categories.api";
import { Text } from "@/components/ui/Text";
import { AddCategoryCard } from "./AddCategoryCard";
import { CategoryCard } from "./CategoryCard";

type GridItem = { type: "category"; data: Category } | { type: "add" };

interface CategoryGridProps {
	searchQuery: string;
}

export function CategoryGrid(props: CategoryGridProps) {
	const { searchQuery } = props;

	const { data: categories, isLoading, isError } = useUserCategories();
	const { width } = useWindowDimensions();

	const itemWidth = (width - 40 - 24) / 3;

	const filteredCategories = useMemo(() => {
		if (!categories) return [];
		if (!searchQuery.trim()) return categories;

		const query = searchQuery.toLowerCase().trim();
		return categories.filter((category) =>
			category.name.toLowerCase().includes(query),
		);
	}, [categories, searchQuery]);

	const gridItems: GridItem[] = useMemo(() => {
		const items: GridItem[] = filteredCategories.map((category) => ({
			type: "category",
			data: category,
		}));
		items.push({ type: "add" });
		return items;
	}, [filteredCategories]);

	if (isLoading) {
		return <CategoryGridSkeleton itemWidth={itemWidth} />;
	}

	if (isError) {
		return (
			<View className="flex-1 items-center justify-center px-6">
				<Text className="text-lg font-medium text-destructive">
					Błąd ładowania kategorii
				</Text>
			</View>
		);
	}

	return (
		<FlatList
			data={gridItems}
			keyExtractor={(item) =>
				item.type === "add" ? "add-category" : item.data.id
			}
			numColumns={3}
			alwaysBounceVertical={false}
			contentContainerClassName="px-5 pb-28"
			renderItem={({ item }) => {
				if (item.type === "add") {
					return <AddCategoryCard width={itemWidth} />;
				}
				return <CategoryCard category={item.data} width={itemWidth} />;
			}}
		/>
	);
}

function SkeletonBox(props: { width: number }) {
	const opacity = useRef(new Animated.Value(0.3)).current;

	useEffect(() => {
		const animation = Animated.loop(
			Animated.sequence([
				Animated.timing(opacity, {
					toValue: 1,
					duration: 800,
					useNativeDriver: true,
				}),
				Animated.timing(opacity, {
					toValue: 0.3,
					duration: 800,
					useNativeDriver: true,
				}),
			]),
		);
		animation.start();
		return () => animation.stop();
	}, [opacity]);

	return (
		<View className="m-1 aspect-square" style={{ width: props.width }}>
			<Animated.View
				style={{ opacity }}
				className="flex-1 items-center justify-center rounded-2xl border border-border bg-muted p-3"
			>
				<View className="mb-2 size-12 rounded-xl bg-muted-foreground/10" />
				<View className="h-4 w-16 rounded bg-muted-foreground/10" />
			</Animated.View>
		</View>
	);
}

function CategoryGridSkeleton(props: { itemWidth: number }) {
	const { itemWidth } = props;
	const skeletonItems = Array.from({ length: 9 }, (_, i) => i);

	return (
		<View className="flex-row flex-wrap px-5">
			{skeletonItems.map((i) => (
				<SkeletonBox key={i} width={itemWidth} />
			))}
		</View>
	);
}
