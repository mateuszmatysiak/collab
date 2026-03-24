import * as React from "react";
import { Switch as RNSwitch } from "react-native";

interface SwitchProps {
	value: boolean;
	onValueChange: (value: boolean) => void;
	className?: string;
	disabled?: boolean;
}

const Switch = React.forwardRef<RNSwitch, SwitchProps>(
	function Switch(props, ref) {
		const { value, onValueChange, disabled, ...restProps } = props;

		return (
			<RNSwitch
				ref={ref}
				value={value}
				onValueChange={onValueChange}
				disabled={disabled}
				trackColor={{
					false: "rgb(var(--input))",
					true: "rgb(var(--primary))",
				}}
				thumbColor={
					value
						? "rgb(var(--primary-foreground))"
						: "rgb(var(--muted-foreground))"
				}
				ios_backgroundColor={"rgb(var(--input))"}
				{...restProps}
			/>
		);
	},
);

export { Switch };
