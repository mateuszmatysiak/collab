import type { RegisterRequest } from "@collab-list/shared/validators";
import { registerSchema } from "@collab-list/shared/validators";
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

export default function RegisterScreen() {
	const { register } = useAuth();

	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterRequest>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: "",
			login: "",
			password: "",
		},
	});

	const onSubmit = async (data: RegisterRequest) => {
		setError(null);
		setIsLoading(true);

		try {
			await register(data.name, data.login, data.password);
			router.replace("/(tabs)/lists");
		} catch (err) {
			const axiosError = err as AxiosError<ApiErrorResponse>;
			const message =
				axiosError.response?.data?.error?.message ||
				"Nastąpił błąd podczas rejestracji";
			setError(message);
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
					<View className="flex-1 items-center justify-center px-6">
						<View className="w-full max-w-sm gap-6">
							<View className="gap-2">
								<Text className="text-3xl font-bold text-foreground">
									Zarejestruj się
								</Text>
								<Text className="text-muted-foreground">
									Utwórz konto, aby rozpocząć
								</Text>
							</View>

							{error && (
								<View className="rounded-xl bg-destructive/10 p-3">
									<Text className="text-destructive">{error}</Text>
								</View>
							)}

							<View className="gap-4">
								<View className="gap-2">
									<Label nativeID="name">Imię i nazwisko</Label>
									<Controller
										control={control}
										name="name"
										render={({ field: { onChange, onBlur, value } }) => (
											<Input
												placeholder="Jan Kowalski"
												value={value}
												onChangeText={onChange}
												onBlur={onBlur}
												autoCapitalize="words"
												autoComplete="name"
												accessibilityLabel="Imię i nazwisko"
												accessibilityHint="Wprowadź swoje imię i nazwisko"
												error={!!errors.name}
											/>
										)}
									/>
									{errors.name && (
										<Text className="text-sm text-destructive">
											{errors.name.message}
										</Text>
									)}
								</View>

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
									className="mt-2"
								>
									<Text>
										{isLoading ? "Rejestracja..." : "Zarejestruj się"}
									</Text>
								</Button>

								<View className="flex-row justify-center gap-1">
									<Text className="text-muted-foreground">
										Masz już konto?{" "}
									</Text>
									<Text
										className="font-medium text-primary"
										onPress={() => router.push("/(auth)/login")}
									>
										Zaloguj się
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
