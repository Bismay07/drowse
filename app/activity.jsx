import { View, Text, TouchableHighlight, TouchableOpacity } from "react-native";
import React from "react";
import { FontAwesome } from "@expo/vector-icons";
import { Touchable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import ActivityCard from "../components/ActivityCard";
import EyeDetector from "../components/detector/EyeDetector";

const Activity = () => {
  const { time } = useLocalSearchParams();
  return (
    <View className="bg-[#dbdbdb] h-screen">
      <View
        className="bg-[#ffffff] flex-row justify-between items-center px-8 py-4
        "
      >
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
        >
          <FontAwesome name="arrow-left" size={25} />
        </TouchableOpacity>
        <View>
          <Text
            style={{
              fontSize: 30,
            }}
          >
            Activity
          </Text>
        </View>
      </View>
      <View className="bg-[#ffffff] mt-4 items-center py-4 mx-4 rounded-2xl px-4">
        <View className="flex-row items-center">
          <TouchableOpacity className="bg-[#88cafa70] py-6 px-4 rounded-full">
            <FontAwesome name="angle-left" size={35} />
          </TouchableOpacity>
          <View className="px-16">
            <Text className="text-5xl font-bold">{time}</Text>
            <Text className='text-lg font-semibold'>Today, Monday 26</Text>
          </View>
          <TouchableOpacity className="bg-[#88cafa70] py-6 px-4 rounded-full">
            <FontAwesome name="angle-right" size={35} />
          </TouchableOpacity>
        </View>
        <View className="h-56 items-center justify-center">
          <Text>Graph</Text>
        </View>
      </View>
      <EyeDetector />
      <View className='bg-[#ffffff] mx-4 mt-4 h-full rounded-xl items-center'>
        <ActivityCard name={'Google'} icon={'google'} time={'14min'} />
        <ActivityCard name={'Play Games'} icon={'play'} time={'16min'} />
        <ActivityCard name={'Youtube'} icon={'youtube'} time={'24min'} />
        <ActivityCard name={'Instagram'} icon={'instagram'} time={'35min'} />
      </View>
    </View>
  );
};

export default Activity;
