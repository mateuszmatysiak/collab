import * as DialogPrimitive from "@rn-primitives/dialog";
import { X } from "lucide-react-native";
import * as React from "react";
import {
	Keyboard,
	KeyboardAvoidingView,
	PanResponder,
	Platform,
	Text as RNText,
	View,
	type ViewProps,
} from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import { FullWindowOverlay as RNFullWindowOverlay } from "react-native-screens";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const SWIPE_THRESHOLD = 80;
const SPRING_CONFIG = { damping: 20, stiffness: 300 };

const DialogCloseContext = React.createContext<(() => void) | null>(null);

const DialogPortal = DialogPrimitive.Portal;

const FullWindowOverlay =
	Platform.OS === "ios" ? RNFullWindowOverlay : React.Fragment;

function Dialog(
	props: DialogPrimitive.RootProps & { children: React.ReactNode },
) {
	const { onOpenChange, children, ...restProps } = props;

	const handleClose = React.useCallback(() => {
		onOpenChange?.(false);
	}, [onOpenChange]);

	return (
		<DialogCloseContext.Provider value={handleClose}>
			<DialogPrimitive.Root onOpenChange={onOpenChange} {...restProps}>
				{children}
			</DialogPrimitive.Root>
		</DialogCloseContext.Provider>
	);
}

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
					"absolute bottom-0 left-0 right-0 top-0 bg-black/40",
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
			variant?: "sheet" | "centered";
		},
) {
	const {
		className,
		portalHost,
		children,
		variant = "sheet",
		...restProps
	} = props;

	const closeDialog = React.useContext(DialogCloseContext);
	const translateY = useSharedValue(0);

	const handleSwipeClose = React.useCallback(() => {
		closeDialog?.();
	}, [closeDialog]);

	const panResponder = React.useMemo(() => {
		if (variant !== "sheet") return null;

		return PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onMoveShouldSetPanResponder: (_, gestureState) => {
				return (
					gestureState.dy > 5 &&
					Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 1.5
				);
			},
			onPanResponderGrant: () => {},
			onPanResponderMove: (_, gestureState) => {
				if (gestureState.dy > 0) {
					translateY.value = gestureState.dy;
				}
			},
			onPanResponderRelease: (_, gestureState) => {
				if (gestureState.dy > SWIPE_THRESHOLD || gestureState.vy > 0.5) {
					translateY.value = withTiming(500, { duration: 200 }, () => {
						translateY.value = 0;
					});
					handleSwipeClose();
				} else {
					translateY.value = withSpring(0, SPRING_CONFIG);
				}
			},
		});
	}, [variant, translateY, handleSwipeClose]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
	}));

	const isSheet = variant === "sheet";

	React.useEffect(() => {
		if (!isSheet) {
			Keyboard.dismiss();
		}
		translateY.value = 0;
	}, [translateY, isSheet]);

	const dialogContent = (
		<Animated.View
			style={isSheet ? animatedStyle : undefined}
			className="w-full"
		>
			<DialogPrimitive.Content
				className={cn(
					"bg-card border-border z-50 flex w-full flex-col gap-4 shadow-lg shadow-black/10",
					isSheet
						? "rounded-t-3xl border-t px-6 pb-8 pt-4"
						: "rounded-2xl border p-6",
					Platform.select({
						web: isSheet
							? "animate-in fade-in-0 slide-in-from-bottom duration-200"
							: "animate-in fade-in-0 zoom-in-95 duration-200",
					}),
					className,
				)}
				style={Platform.OS !== "web" ? { width: "100%" } : undefined}
				{...restProps}
			>
				{isSheet && (
					<View
						{...(panResponder?.panHandlers ?? {})}
						className="items-center py-4 -mt-2 -mx-6 px-6"
					>
						<View className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
					</View>
				)}
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
					<RNText className="sr-only">Zamknij</RNText>
				</DialogPrimitive.Close>
			</DialogPrimitive.Content>
		</Animated.View>
	);

	return (
		<DialogPortal hostName={portalHost}>
			<DialogOverlay>
				{isSheet ? (
					<KeyboardAvoidingView
						behavior={Platform.OS === "ios" ? "padding" : "height"}
						style={{ flex: 1, justifyContent: "flex-end" }}
					>
						{dialogContent}
					</KeyboardAvoidingView>
				) : (
					<View className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center px-4">
						{dialogContent}
					</View>
				)}
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
