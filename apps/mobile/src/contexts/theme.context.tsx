import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { colorScheme, vars } from "nativewind";
import {
	createContext,
	type PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { StatusBar, View } from "react-native";
import { getTheme, setTheme, type Theme } from "@/lib/storage";
import { colors } from "@/lib/theme";

function createThemeVars(theme: (typeof colors)[keyof typeof colors]) {
	return vars({
		"--background": theme.background,
		"--foreground": theme.foreground,
		"--card": theme.card,
		"--card-foreground": theme.cardForeground,
		"--popover": theme.popover,
		"--popover-foreground": theme.popoverForeground,
		"--primary": theme.primary,
		"--primary-foreground": theme.primaryForeground,
		"--secondary": theme.secondary,
		"--secondary-foreground": theme.secondaryForeground,
		"--muted": theme.muted,
		"--muted-foreground": theme.mutedForeground,
		"--accent": theme.accent,
		"--accent-foreground": theme.accentForeground,
		"--destructive": theme.destructive,
		"--destructive-foreground": theme.destructiveForeground,
		"--border": theme.border,
		"--input": theme.input,
		"--ring": theme.ring,
	});
}

const lightTheme = createThemeVars(colors.light);
const darkTheme = createThemeVars(colors.dark);

interface ThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
	setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider(props: PropsWithChildren) {
	const { children } = props;

	const [theme, setThemeState] = useState<Theme>("light");
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function loadTheme() {
			try {
				const savedTheme = await getTheme();
				setThemeState(savedTheme);
				colorScheme.set(savedTheme);
			} catch (error) {
				console.error("Error loading theme:", error);
			} finally {
				setIsLoading(false);
			}
		}
		loadTheme();
	}, []);

	const updateTheme = useCallback((newTheme: Theme) => {
		setThemeState(newTheme);
		colorScheme.set(newTheme);
		setTheme(newTheme).catch((error) => {
			console.error("Error persisting theme:", error);
		});
	}, []);

	const toggleTheme = useCallback(() => {
		const newTheme = theme === "light" ? "dark" : "light";
		updateTheme(newTheme);
	}, [theme, updateTheme]);

	const memoizedValue: ThemeContextType = useMemo(
		() => ({
			theme,
			toggleTheme,
			setTheme: updateTheme,
		}),
		[theme, toggleTheme, updateTheme],
	);

	const loadingValue: ThemeContextType = useMemo(
		() => ({
			theme: "light",
			toggleTheme: () => {},
			setTheme: () => {},
		}),
		[],
	);

	const currentTheme = isLoading ? "light" : theme;
	const themeVars = currentTheme === "dark" ? darkTheme : lightTheme;
	const navTheme = currentTheme === "dark" ? DarkTheme : DefaultTheme;

	return (
		<ThemeContext.Provider value={isLoading ? loadingValue : memoizedValue}>
			<NavigationThemeProvider value={navTheme}>
				<StatusBar
					barStyle={
						!isLoading && theme === "dark" ? "light-content" : "dark-content"
					}
					backgroundColor="transparent"
					translucent
				/>
				<View style={[{ flex: 1 }, themeVars]}>{children}</View>
			</NavigationThemeProvider>
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);

	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}

	return context;
}
