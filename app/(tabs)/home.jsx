import {
	View,
	Text,
	FlatList,
	Image,
	TouchableOpacity,
	TouchableHighlight,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Logo from "../../components/Logo";
import pixel from "../../assets/images/pixel9pro.png";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
// import { FontAwesome } from "@expo/vector-icons";

const Home = () => {
	const time = '2h 36m'
	return (
		<SafeAreaView className="bg-olive-BLACK h-full">
			{/* <Logo /> */}
			<TouchableOpacity onPress={() => {
				router.push({ pathname: 'activity', params: { time } })
			}}>
				<View className="bg-[#ffffff] rounded-3xl mx-4 px-8 py-16 mt-8 flex-row items-center">
					<View>
						<Text className="text-4xl font-bold">{time}</Text>
						<Text className="text-md font-semibold">Time Spent Today</Text>
					</View>
					<View className="flex-row justify-center items-center w-full">
						<View className="flex-row gap-2 items-center">
							<View className="bg-[#a9a9a9] h-28 w-14 rounded-full"></View>
							<View className="bg-[#a9a9a9] h-36 w-14 rounded-full"></View>
							<View className="bg-[#a9a9a9] h-28 w-14 rounded-full"></View>
						</View>
					</View>
				</View>
			</TouchableOpacity>
			<TouchableOpacity>
				<View className="bg-[#ffffff] rounded-3xl mx-4 px-8 py-12 mt-8 gap-4 items-center">
					<View className="flex-row justify-start items-center gap-2">
						<View className="w-1/4">
							<Image source={pixel} className="w-12 h-20" />
						</View>
						<View className="flex-row w-2/3 justify-start">
							<View>
								<Text className="text-3xl font-semibold">Google Pixel 9</Text>
								<Text className="text-[#4682fb] font-bold text-lg">
									Unlocked
								</Text>
							</View>
							<View>
								<Text className="text-3xl ">{">"}</Text>
							</View>
						</View>
					</View>
					<TouchableOpacity>
						<View className="bg-[#aedcff] w-[80vw] py-4 rounded-full">
							<Text className="text-xl text-center font-semibold">Lock</Text>
						</View>
					</TouchableOpacity>
				</View>
			</TouchableOpacity>
			<TouchableOpacity>
				<View className="bg-[#ffffff] gap-3 rounded-t-3xl mb-1 mx-4 px-8 py-10 mt-8 flex-row items-center">
					<View>
						<FontAwesome name="hourglass-half" size={35} />
					</View>
					<View>
						<Text className="text-xl font-semibold">Time limits</Text>
						<Text className="">Daily limit & app limits off</Text>
					</View>
				</View>
			</TouchableOpacity>
			<TouchableOpacity>
				<View className="bg-[#ffffff] gap-3 rounded-b-3xl mx-4 px-8 py-10 mt-1 flex-row items-center">
					<View>
						<FontAwesome name="calendar" size={35} />
					</View>
					<View>
						<Text className="text-xl font-semibold">Schedule</Text>
						<Text>Downttime & school time off</Text>
					</View>
				</View>
			</TouchableOpacity>
		</SafeAreaView>
	);
};

export default Home;
