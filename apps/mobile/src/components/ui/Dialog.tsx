import * as DialogPrimitive from "@rn-primitives/dialog";
import { X } from "lucide-react-native";
import * as React from "react";
import {
	Keyboard,
	Platform,
	Text as RNText,
	View,
	type ViewProps,
} from "react-native";
import { FullWindowOverlay as RNFullWindowOverlay } from "react-native-screens";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;

const FullWindowOverlay =
	Platform.OS === "ios" ? RNFullWindowOverlay : React.Fragment;

function DialogOverlay(
	props: Omit<DialogPrimitive.OverlayProps, "asChild"> &
		React.RefAttributes<DialogPrimitive.OverlayRef> & {
			children?: React.ReactNode;
		},
) {
	const { className, children, ...restProps } = props;

	return (
		<FullWindowOverlay>
			<DialogPrimitive.Overlay
				className={cn(
					"absolute bottom-0 left-0 right-0 top-0 bg-black/50 p-4",
					Platform.select({
						web: "animate-in fade-in-0 fixed cursor-default [&>*]:cursor-auto",
					}),
					className,
				)}
				style={Platform.OS !== "web" ? { width: "100%", flex: 1 } : undefined}
				{...restProps}
				asChild={Platform.OS !== "web"}
			>
				{children}
			</DialogPrimitive.Overlay>
		</FullWindowOverlay>
	);
}

function DialogContent(
	props: DialogPrimitive.ContentProps &
		React.RefAttributes<DialogPrimitive.ContentRef> & {
			portalHost?: string;
			centered?: boolean;
		},
) {
	const { className, portalHost, centered, children, ...restProps } = props;

	React.useEffect(() => {
		Keyboard.dismiss();
	}, []);

	return (
		<DialogPortal hostName={portalHost}>
			<DialogOverlay>
				<View
					className={cn(
						"absolute bottom-0 left-0 right-0 top-0",
						centered ? "justify-center items-center" : "pt-[20%]",
					)}
				>
					<DialogPrimitive.Content
						className={cn(
							"bg-background border-border z-50 flex w-full flex-col gap-4 rounded-lg border p-6 shadow-lg shadow-black/5",
							Platform.select({
								web: "animate-in fade-in-0 zoom-in-95 duration-200",
							}),
							className,
						)}
						style={Platform.OS !== "web" ? { width: "100%" } : undefined}
						{...restProps}
					>
						{children}
						<DialogPrimitive.Close
							className={cn(
								"absolute right-4 top-4 rounded opacity-70 active:opacity-100",
								Platform.select({
									web: "ring-offset-background focus:ring-ring data-[state=open]:bg-accent transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2",
								}),
							)}
							hitSlop={12}
						>
							<Icon
								as={X}
								className={cn(
									"text-accent-foreground web:pointer-events-none size-4 shrink-0",
								)}
							/>
							<RNText className="sr-only">Close</RNText>
						</DialogPrimitive.Close>
					</DialogPrimitive.Content>
				</View>
			</DialogOverlay>
		</DialogPortal>
	);
}

function DialogHeader(props: ViewProps) {
	const { className, ...restProps } = props;

	return (
		<View
			className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
			{...restProps}
		/>
	);
}

function DialogFooter(props: ViewProps) {
	const { className, ...restProps } = props;

	return (
		<View
			className={cn(
				"flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
				className,
			)}
			{...restProps}
		/>
	);
}

function DialogTitle(
	props: DialogPrimitive.TitleProps &
		React.RefAttributes<DialogPrimitive.TitleRef>,
) {
	const { className, ...restProps } = props;

	return (
		<DialogPrimitive.Title
			className={cn(
				"text-foreground text-lg font-semibold leading-none",
				className,
			)}
			{...restProps}
		/>
	);
}

function DialogDescription(
	props: DialogPrimitive.DescriptionProps &
		React.RefAttributes<DialogPrimitive.DescriptionRef>,
) {
	const { className, ...restProps } = props;

	return (
		<DialogPrimitive.Description
			className={cn("text-muted-foreground text-sm", className)}
			{...restProps}
		/>
	);
}

export {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
};
