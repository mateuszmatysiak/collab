import * as CheckboxPrimitive from "@rn-primitives/checkbox";
import { Check } from "lucide-react-native";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

const Checkbox = React.forwardRef<
	CheckboxPrimitive.RootRef,
	CheckboxPrimitive.RootProps
>(function Checkbox(props, ref) {
	const { className, checked, ...restProps } = props;

	return (
		<CheckboxPrimitive.Root
			ref={ref}
			checked={checked}
			className={cn(
				"size-7 rounded-sm border border-primary flex items-center justify-center",
				checked && "bg-primary",
				className,
			)}
			hitSlop={8}
			{...restProps}
		>
			<CheckboxPrimitive.Indicator>
				<Icon as={Check} className="text-primary-foreground" size={14} />
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	);
});

export { Checkbox };
