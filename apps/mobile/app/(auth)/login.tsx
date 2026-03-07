import type { LoginRequest } from "@collab-list/shared/validators";
import { loginSchema } from "@collab-list/shared/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Text } from "@/components/ui/Text";
import { useAuth } from "@/contexts/auth.context";
import type { ApiErrorResponse } from "@/types/api";

export default function LoginScreen() {
	const { login } = useAuth();

	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginRequest>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			login: "",
			password: "",
		},
	});

	const onSubmit = async (data: LoginRequest) => {
		setError(null);
		setIsLoading(true);

		try {
			await login(data.login, data.password);
			router.replace("/(tabs)/lists");
		} catch (err) {
			const axiosError = err as AxiosError<ApiErrorResponse>;

			if (axiosError.response) {
				setError(
					axiosError.response.data?.error?.message ||
						`Błąd serwera: ${axiosError.response.status}`,
				);
			} else if (axiosError.request) {
				setError("Nie można połączyć się z serwerem. Sprawdź połączenie.");
			} else {
				setError(axiosError.message || "Nieznany błąd");
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={{ flex: 1 }}
			>
				<ScrollView
					contentContainerStyle={{ flexGrow: 1 }}
					keyboardShouldPersistTaps="handled"
				>
					<View className="flex-1 justify-start px-6 pt-[25%]">
						<View className="gap-6">
							<View className="gap-2">
								<Text className="text-3xl font-bold">Zaloguj się</Text>
								<Text className="text-muted-foreground">
									Wprowadź swoje dane, aby się zalogować
								</Text>
							</View>

							{error && (
								<View className="rounded-md bg-destructive/10 p-3">
									<Text className="text-destructive">{error}</Text>
								</View>
							)}

							<View className="gap-4">
								<View className="gap-2">
									<Label nativeID="login">Login</Label>
									<Controller
										control={control}
										name="login"
										render={({ field: { onChange, onBlur, value } }) => (
											<Input
												placeholder="jankowalski"
												value={value}
												onChangeText={onChange}
												onBlur={onBlur}
												autoCapitalize="none"
												autoComplete="username"
												accessibilityLabel="Login"
												accessibilityHint="Wprowadź swój login"
												error={!!errors.login}
											/>
										)}
									/>
									{errors.login && (
										<Text className="text-sm text-destructive">
											{errors.login.message}
										</Text>
									)}
								</View>

								<View className="gap-2">
									<Label nativeID="password">Hasło</Label>
									<Controller
										control={control}
										name="password"
										render={({ field: { onChange, onBlur, value } }) => (
											<PasswordInput
												placeholder="Wprowadź swoje hasło"
												value={value}
												onChangeText={onChange}
												onBlur={onBlur}
												autoCapitalize="none"
												autoComplete="password"
												accessibilityLabel="Hasło"
												accessibilityHint="Wprowadź swoje hasło"
												error={!!errors.password}
											/>
										)}
									/>
									{errors.password && (
										<Text className="text-sm text-destructive">
											{errors.password.message}
										</Text>
									)}
								</View>

								<Button
									onPress={handleSubmit(onSubmit)}
									disabled={isLoading}
									className="mt-4"
								>
									<Text>{isLoading ? "Logowanie..." : "Zaloguj się"}</Text>
								</Button>

								<View className="flex-row justify-center gap-1">
									<Text className="text-muted-foreground">
										Nie masz konta?{" "}
									</Text>
									<Text
										className="text-primary font-medium"
										onPress={() => router.push("/(auth)/register")}
									>
										Zarejestruj się
									</Text>
								</View>
							</View>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
