import type { ListWithDetails } from "@collab-list/shared/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	Animated,
	FlatList,
	Pressable,
	RefreshControl,
	StyleSheet,
	View,
} from "react-native";
import { useLists } from "@/api/lists.api";
import { Text } from "@/components/ui/Text";
import { CreateListButton } from "./CreateListButton";
import { ListCard } from "./ListCard";

export type ListFilter = "all" | "mine" | "shared";

interface ListsContentProps {
	filter?: ListFilter;
}

const styles = StyleSheet.create({
	listContent: {
		paddingHorizontal: 20,
		paddingBottom: 100,
	},
});

function SeparatorItem() {
	return <View className="h-3.5" />;
}

function ListCardRender(props: { item: ListWithDetails }) {
	const { item } = props;

	return <ListCard list={item} />;
}

function SkeletonPulse(props: {
	children: React.ReactNode;
	className?: string;
}) {
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
		<Animated.View style={{ opacity }} className={props.className}>
			{props.children}
		</Animated.View>
	);
}

function ListCardSkeleton() {
	return (
		<View className="rounded-2xl border border-border bg-card px-4 pb-3 pt-4">
			<View className="flex-row items-center gap-3">
				<View className="size-12 rounded-xl bg-muted-foreground/10" />
				<View className="flex-1 gap-2">
					<View className="h-4 w-3/4 rounded bg-muted-foreground/10" />
					<View className="h-3 w-1/3 rounded bg-muted-foreground/10" />
				</View>
				<View className="size-8 rounded-full bg-muted-foreground/10" />
			</View>
			<View className="mt-3 h-1.5 rounded-full bg-muted-foreground/10" />
		</View>
	);
}

function ListsSkeleton() {
	return (
		<SkeletonPulse className="px-5 gap-3.5 pt-1">
			<ListCardSkeleton />
			<ListCardSkeleton />
			<ListCardSkeleton />
			<ListCardSkeleton />
		</SkeletonPulse>
	);
}

function EmptyList() {
	return (
		<View className="flex-1 items-center justify-center gap-4 py-12">
			<Text className="text-lg font-medium text-muted-foreground">
				Brak list
			</Text>
			<Text className="text-sm text-muted-foreground">
				Utwórz pierwszą listę, klikając przycisk poniżej
			</Text>
		</View>
	);
}

export function ListsContent(props: ListsContentProps) {
	const { filter = "all" } = props;

	const { data: lists, isLoading, isError, refetch } = useLists();
	const [isManualRefresh, setIsManualRefresh] = useState(false);

	const filteredLists = useMemo(() => {
		if (!lists) return [];

		switch (filter) {
			case "all":
				return lists;
			case "mine":
				return lists.filter((list) => list.role === "owner");
			case "shared":
				return lists.filter((list) => list.role === "editor");
			default:
				return lists;
		}
	}, [lists, filter]);

	const handleRefresh = useCallback(async () => {
		setIsManualRefresh(true);
		await refetch();
		setIsManualRefresh(false);
	}, [refetch]);

	if (isLoading) {
		return <ListsSkeleton />;
	}

	if (isError) {
		return (
			<View className="flex-1 items-center justify-center gap-2 px-6">
				<Text className="text-lg font-medium text-destructive">
					Błąd ładowania
				</Text>
				<Pressable onPress={handleRefresh}>
					<Text className="text-primary underline">Spróbuj ponownie</Text>
				</Pressable>
			</View>
		);
	}

	return (
		<FlatList
			data={filteredLists}
			keyExtractor={(item) => item.id}
			renderItem={ListCardRender}
			ListEmptyComponent={<EmptyList />}
			ItemSeparatorComponent={SeparatorItem}
			ListFooterComponent={
				<View className="py-4">
					<CreateListButton />
				</View>
			}
			contentContainerStyle={styles.listContent}
			showsVerticalScrollIndicator={false}
			refreshControl={
				<RefreshControl
					refreshing={isManualRefresh}
					onRefresh={handleRefresh}
				/>
			}
		/>
	);
}
