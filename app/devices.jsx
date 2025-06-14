import { View, Text, Image } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Logo from "../components/Logo";
import { images } from "../constants";
const devices = () => {
	return (
		<SafeAreaView className="bg-olive-BLACK w-full h-full flex">
			<StatusBar style="light" />
			<Logo
				withName="true"
				classname="justify-center mt-10"
				size={60}
				textClassName="text-5xl"
			/>
			<Image resizeMode="contain" source={images.parentChild} />
			<Text>Does your child use the same phone?</Text>
		</SafeAreaView>
	);
};

export default devices;
