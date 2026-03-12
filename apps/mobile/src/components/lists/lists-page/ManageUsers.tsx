import type { ListWithDetails } from "@collab-list/shared/types";
import { Users } from "lucide-react-native";
import { useState } from "react";
import { type GestureResponderEvent, Pressable, View } from "react-native";
import { UserAvatar } from "@/components/lists/shared/UserAvatar";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import { ManageUsersDialog } from "./ManageUsersDialog";

const MAX_VISIBLE_AVATARS = 3;

interface ManageUsersProps {
	list: ListWithDetails;
}

export function ManageUsers(props: ManageUsersProps) {
	const { list } = props;

	const [isManageUsersOpen, setIsManageUsersOpen] = useState(false);

	const visibleShares = list.shares.slice(0, MAX_VISIBLE_AVATARS);
	const remainingCount = Math.max(0, list.shares.length - MAX_VISIBLE_AVATARS);
	const hasShares = list.shares.length > 0;

	function handleManageUsers(e: GestureResponderEvent) {
		e.stopPropagation();
		setIsManageUsersOpen(true);
	}

	return (
		<>
			<View className="flex-row items-center gap-2">
				{hasShares && (
					<View className="flex-row items-center">
						{visibleShares.map((share, index) => (
							<View
								key={share.userId}
								className={cn(index === 0 ? "ml-0" : "-ml-3")}
							>
								<UserAvatar
									name={share.userName}
									className="border-2 border-card"
								/>
							</View>
						))}
						{remainingCount > 0 && (
							<View className="-ml-3 size-8 items-center justify-center rounded-full border-2 border-card bg-primary/15">
								<Text className="text-xs font-medium text-primary">
									+{remainingCount}
								</Text>
							</View>
						)}
					</View>
				)}
				<Pressable
					onPress={handleManageUsers}
					className="size-9 items-center justify-center rounded-xl border border-border bg-background active:bg-muted"
					hitSlop={8}
				>
					<Icon as={Users} className="text-foreground" size={16} />
				</Pressable>
			</View>

			<ManageUsersDialog
				list={list}
				open={isManageUsersOpen}
				onOpenChange={setIsManageUsersOpen}
			/>
		</>
	);
}
