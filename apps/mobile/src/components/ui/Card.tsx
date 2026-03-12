import { View, type ViewProps } from "react-native";
import { Text, TextClassContext } from "@/components/ui/Text";
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

type CardHeaderProps = ViewProps & React.RefAttributes<View>;

function CardHeader(props: CardHeaderProps) {
	const { className, ...restProps } = props;

	return (
		<View
			className={cn("flex flex-col gap-1.5 px-6", className)}
			{...restProps}
		/>
	);
}

type CardTitleProps = React.ComponentProps<typeof Text> &
	React.RefAttributes<Text>;

function CardTitle(props: CardTitleProps) {
	const { className, ...restProps } = props;

	return (
		<Text
			role="heading"
			aria-level={3}
			className={cn("font-semibold leading-none", className)}
			{...restProps}
		/>
	);
}

type CardContentProps = ViewProps & React.RefAttributes<View>;

function CardContent(props: CardContentProps) {
	const { className, ...restProps } = props;

	return <View className={cn("px-6", className)} {...restProps} />;
}

export { Card, CardContent, CardHeader, CardTitle };
