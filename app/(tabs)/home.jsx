import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Logo from "../../components/Logo";
import pixel from "../../assets/images/pixel9pro.png";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { useGlobalContext } from "../../context/GlobalProvider";
import { StatusBar } from "expo-status-bar";
import { ScrollView } from "react-native";

const Home = () => {
	const time = "3h 36m";
	const {
		isToddlerModeActive,
		isDeviceAdminEnabled,
		startToddlerMode,
		stopToddlerMode,
		user,
	} = useGlobalContext();

	return (
		<SafeAreaView className="bg-olive-BLACK h-full w-full">
			<StatusBar backgroundColor="#2e382e" style="light" />
			<View className="flex-row justify-between mx-5 my-4">
				<View className="flex-row items-center gap-3">
					<Logo />
					<Text className="text-orange-peel-500 font-plight text-2xl">
						{`Welcome, ${user?.username || "Guest"}`}
					</Text>
				</View>
				<View className="h-12 w-12 rounded-tr-3xl rounded-bl-3xl rounded-tl-md rounded-br-md bg-orange-peel-600 justify-center items-center">
					<Text className="text-olive-50 font-psemibold text-3xl">
						{user?.username.slice(0, 1) || "G"}
					</Text>
				</View>
			</View>
			<ScrollView className="border-t border-olive-800">
				{/* Activity Card */}

				<TouchableOpacity
					onPress={() => {
						router.push({ pathname: "activity", params: { time } });
					}}
				>
					<View className="bg-olive-50 rounded-3xl mx-4 px-8 py-12 mt-8 grid grid-cols-3 items-center">
						<View className="mb-3">
							<Text className="text-4xl font-bold">{time}</Text>
							<Text className="text-md font-semibold">Time Spent Today</Text>
						</View>
						<View className="flex-row justify-center items-center w-full">
							<View className="flex-row gap-2 items-center">
								<View className="bg-olive-700 h-28 w-14 rounded-full"></View>
								<View className="bg-olive-700 h-36 w-14 rounded-full"></View>
								<View className="bg-olive-700 h-28 w-14 rounded-full"></View>
							</View>
						</View>
					</View>
				</TouchableOpacity>
				{/* Toddler Mode */}

				<TouchableOpacity
					onPress={() => {
						const admin = isDeviceAdminEnabled();
						console.log("admin", admin);
					}}
				>
					<View className="bg-olive-50 rounded-3xl mx-4 px-8 py-7 mt-8 gap-4 items-center">
						<View className="flex-row justify-start items-center gap-2">
							<View className="w-1/4">
								<Image source={pixel} className="w-12 h-20" />
							</View>
							<View className="flex-row w-2/3 justify-between items-center">
								<View>
									<Text className="text-3xl font-semibold">Toddler Mode</Text>
									<Text className="text-orange-peel-600 font-bold text-lg">
										{isToddlerModeActive ? "On" : "Off"}
									</Text>
								</View>
								<View>
									<FontAwesome name="angle-right" size={35} />
								</View>
							</View>
						</View>
						<TouchableOpacity
							onPress={() => {
								if (!isToddlerModeActive && isDeviceAdminEnabled()) {
									startToddlerMode();
								} else {
									stopToddlerMode();
								}
							}}
						>
							<View className="bg-orange-peel-400 w-[80vw] py-4 rounded-full">
								<Text className="text-xl text-center font-semibold">
									{isToddlerModeActive ? "Turn Off" : "Turn On"}
								</Text>
							</View>
						</TouchableOpacity>
					</View>
				</TouchableOpacity>
				{/* Stats */}


				<TouchableOpacity
					onPress={() => {
						getUsageStats();
					}}
				>
					<View className="bg-[#ffffff] gap-3 rounded-3xl mb-1 mx-4 px-8 py-10 mt-8 flex-row items-center">
						<Text>Stats</Text>
					</View>
				</TouchableOpacity>
				{/* Time limits */}


				<TouchableOpacity onPress={()=>{
					router.push({pathname: "timelimit"})
				}}>
					<View className="bg-olive-50 gap-3 rounded-t-3xl mb-1 mx-4 px-5 py-5 mt-8 flex-row items-center">
						<View>
							<FontAwesome name="hourglass-half" size={25} color="#e27700" />
						</View>
						<View>
							<Text className="text-xl font-semibold">Time limits</Text>
							<Text className="text-slate-600">
								Daily limit & app limits off
							</Text>
						</View>
					</View>
				</TouchableOpacity>
				{/* Schedule */}

				<TouchableOpacity>
					<View className="bg-olive-50 gap-3 rounded-b-3xl mb-4 mx-4 px-5 py-5 mt-1 flex-row items-center">
						<View>
							<FontAwesome name="calendar" size={25} color="#e27700" />
						</View>
						<View>
							<Text className="text-xl font-semibold">Schedule</Text>
							<Text className="text-slate-600">
								Downtime & school time off
							</Text>
						</View>
					</View>
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	);
};

export default Home;
