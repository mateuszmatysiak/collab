import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import {
	Platform,
	Pressable,
	TextInput,
	type TextInputProps,
	View,
} from "react-native";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

interface PasswordInputProps extends Omit<TextInputProps, "secureTextEntry"> {
	error?: boolean;
}

function PasswordInput(props: PasswordInputProps) {
	const { className, error, ...restProps } = props;

	const [isVisible, setIsVisible] = useState(false);

	return (
		<View className="relative">
			<TextInput
				className={cn(
					"border-input bg-card dark:bg-background text-foreground flex h-12 w-full min-w-0 flex-row items-center rounded-xl border px-4 py-1 pr-12 text-base leading-5 shadow-sm shadow-black/5",
					error && "border-destructive",
					restProps.editable === false &&
						cn(
							"opacity-50",
							Platform.select({
								web: "disabled:pointer-events-none disabled:cursor-not-allowed",
							}),
						),
					Platform.select({
						web: cn(
							"placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground outline-none transition-[color,box-shadow] md:text-sm",
							"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
							error &&
								"ring-destructive/20 dark:ring-destructive/40 border-destructive",
						),
						native: "placeholder:text-muted-foreground/50",
					}),
					className,
				)}
				secureTextEntry={!isVisible}
				{...(Platform.OS === "web" && error ? { "aria-invalid": true } : {})}
				{...restProps}
			/>
			<Pressable
				onPress={() => setIsVisible(!isVisible)}
				className="absolute right-3 top-0 bottom-0 justify-center"
				accessibilityLabel={isVisible ? "Ukryj hasło" : "Pokaż hasło"}
				accessibilityRole="button"
			>
				<Icon
					as={isVisible ? EyeOff : Eye}
					size={20}
					className="text-muted-foreground"
				/>
			</Pressable>
		</View>
	);
}

export { PasswordInput };
