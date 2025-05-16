import { View, Text, ScrollView, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../constants";
import { StatusBar } from "expo-status-bar";
import CustomButton from "../components/CustomButton";
import { Redirect, router } from "expo-router";
import Logo from "../components/Logo";
import { useGlobalContext } from "@/context/GlobalProvider";
import authService from "@/libs/appwrite/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
	const [isSignUpLoading, setIsSignUpLoading] = useState(false);
	const { isLoading, isLoggedIn } = useGlobalContext();

	useEffect(() => {
		const res = authService.getCurrentUser()
		console.log("user", res);
		console.log("stored user : ", AsyncStorage.getItem('user'));


	}, [])

	const handleSignUp = async () => {
		try {
			setIsSignUpLoading(true);
			router.push('/sign-up');
		} catch (error) {
			console.error('Navigation error:', error);
		} finally {
			setIsSignUpLoading(false);
		}
	};

	if (!isLoading && isLoggedIn) return <Redirect href={"/home"} />;

	return (
		<SafeAreaView className="bg-olive-BLACK h-full">
			<StatusBar backgroundColor="#161622" style="light" />
			<ScrollView contentContainerStyle={{ height: "100%" }}>
				<View className="w-full h-full items-center justify-center px-4">
					<Logo
						color="#9baf99"
						withName={true}
						size={50}
						className="mb-20"
						textClassName="text-5xl"
					/>
					<Image
						className="max-w-[380px] w-full h-[300px]"
						resizeMode="contain"
						source={images.cards}
					/>
					<View className="mt-7 px-4 justify-center items-center ">
						<Text className="text-3xl text-white font-bold text-center tracking-wider">
							Turn Screen Time into Smart Time with{" "}
							<Text className="text-robins-egg-blue-400 text-4xl font-dscript">
								Drowse
							</Text>
						</Text>
						<Text className="text-gray-200 text-sm font-pregular text-center mt-7">
							Drowse helps parents curb phone addiction in kids with smart
							restrictions and controlled screen time.
						</Text>
					</View>
					<CustomButton
						title="Continue with email"
						containerStyle={"w-full mt-7"}
						isLoading={isSignUpLoading}
						handlePress={handleSignUp}
					/>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
