import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import "../global.css";
import { useEffect } from "react";
import GlobalProvider from "../context/GlobalProvider"
import { StatusBar } from "expo-status-bar";
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [fontsLoaded, error] = useFonts({
		"Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
		"Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
		"Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
		"Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
		"Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
		"Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
		"Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
		"Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
		"Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
		"Dancing-Script": require("../assets/fonts/Dancing-Script.ttf"),
	});

	useEffect(() => {
		if (error) throw error;
		if (fontsLoaded) {
			SplashScreen.hideAsync();
		}
	}, [fontsLoaded, error]);

	if (!fontsLoaded) {
		return null;
	}

	return (
		<GlobalProvider>
			<Stack screenOptions={{ headerShown: false }}>
				<StatusBar style={"auto"} />
				<Stack.Screen name={"index"} />
				<Stack.Screen name={"(auth)"} />
				<Stack.Screen name={"activity"} />
				<Stack.Screen name={"timelimit"} />
			</Stack>
		</GlobalProvider>
	);
}
