import { View, type ViewProps } from "react-native";
import { TextClassContext } from "@/components/ui/Text";
import { cn } from "@/lib/utils";

type CardProps = ViewProps & React.RefAttributes<View>;

function Card(props: CardProps) {
	const { className, ...restProps } = props;

	return (
		<TextClassContext.Provider value="text-card-foreground">
			<View
				className={cn(
					"bg-card border-border flex flex-col gap-6 rounded-2xl border py-6 shadow-sm shadow-black/5",
					className,
				)}
				{...restProps}
			/>
		</TextClassContext.Provider>
	);
}

export { Card };
