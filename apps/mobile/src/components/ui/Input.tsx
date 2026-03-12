import { Platform, TextInput, type TextInputProps } from "react-native";
import { cn } from "@/lib/utils";

interface InputProps extends TextInputProps {
	error?: boolean;
}

type InputComponentProps = InputProps & React.RefAttributes<TextInput>;

function Input(props: InputComponentProps) {
	const { className, error, ...restProps } = props;

	return (
		<TextInput
			className={cn(
				"border-input bg-card dark:bg-background text-foreground flex h-12 w-full min-w-0 flex-row items-center rounded-xl border px-4 py-1 text-base leading-5 shadow-sm shadow-black/5",
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
			{...(Platform.OS === "web" && error ? { "aria-invalid": true } : {})}
			{...restProps}
		/>
	);
}

export { Input };
