import { View, Text } from "react-native";
import React from "react";
import { FontAwesome } from "@expo/vector-icons";

const ActivityCard = ({ icon, name, time }) => {
  return (
    <View className="py-4 px-4 flex-row mt-4 gap-4 border-b-[0.5px] w-[90%]">
      <View>
        <FontAwesome name={icon} size={35} />
      </View>
      <View>
        <Text className="text-xl font-semibold">{name}</Text>
        <Text>{time}</Text>
      </View>
    </View>
  );
};

export default ActivityCard;
