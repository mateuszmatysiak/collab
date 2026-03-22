import type { LucideIcon } from "lucide-react-native";
import { Check, ChevronDown } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";

interface SelectOption<T extends string> {
	value: T;
	label: string;
	icon?: LucideIcon;
}

interface GlassSelectProps<T extends string> {
	options: SelectOption<T>[];
	value: T;
	onValueChange: (value: T) => void;
	placeholder?: string;
}

export function GlassSelect<T extends string>(props: GlassSelectProps<T>) {
	const { options, value, onValueChange, placeholder } = props;

	const [isOpen, setIsOpen] = useState(false);
	const [triggerLayout, setTriggerLayout] = useState({
		x: 0,
		y: 0,
		width: 0,
		height: 0,
	});

	const selectedOption = options.find((opt) => opt.value === value);

	const handleSelect = useCallback(
		(optionValue: T) => {
			onValueChange(optionValue);
			setIsOpen(false);
		},
		[onValueChange],
	);

	const handleOpen = useCallback(() => {
		setIsOpen(true);
	}, []);

	return (
		<View
			onLayout={(e) => {
				e.target.measureInWindow((x, y, width, height) => {
					setTriggerLayout({ x, y, width, height });
				});
			}}
		>
			<Pressable
				onPress={handleOpen}
				className="h-11 flex-row items-center justify-between rounded-xl border border-border bg-card px-3"
			>
				{selectedOption?.icon && (
					<Icon
						as={selectedOption.icon}
						className="mr-2 text-muted-foreground"
						size={16}
					/>
				)}
				<Text
					className="flex-1 text-sm font-medium text-foreground"
					numberOfLines={1}
				>
					{selectedOption?.label ?? placeholder ?? "Wybierz..."}
				</Text>
				<Icon
					as={ChevronDown}
					className="ml-1 text-muted-foreground"
					size={16}
				/>
			</Pressable>

			<Modal
				visible={isOpen}
				transparent
				animationType="fade"
				onRequestClose={() => setIsOpen(false)}
			>
				<Pressable className="flex-1" onPress={() => setIsOpen(false)}>
					<View
						style={{
							position: "absolute",
							top: triggerLayout.y + triggerLayout.height + 4,
							left: triggerLayout.x,
							width: triggerLayout.width,
						}}
					>
						<View className="overflow-hidden rounded-xl border border-border bg-card shadow-lg shadow-black/10">
							{options.map((option) => {
								const isSelected = option.value === value;
								return (
									<Pressable
										key={option.value}
										onPress={() => handleSelect(option.value)}
										className={
											isSelected
												? "flex-row items-center bg-primary/5 px-3 py-3"
												: "flex-row items-center px-3 py-3 active:bg-muted"
										}
									>
										{option.icon && (
											<Icon
												as={option.icon}
												className={
													isSelected
														? "mr-2 text-primary"
														: "mr-2 text-muted-foreground"
												}
												size={16}
											/>
										)}
										<Text
											className={
												isSelected
													? "flex-1 text-sm font-semibold text-primary"
													: "flex-1 text-sm font-medium text-foreground"
											}
										>
											{option.label}
										</Text>
										{isSelected && (
											<Icon as={Check} className="text-primary" size={16} />
										)}
									</Pressable>
								);
							})}
						</View>
					</View>
				</Pressable>
			</Modal>
		</View>
	);
}
