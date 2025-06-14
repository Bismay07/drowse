import { View, Text, Button, TouchableOpacity } from 'react-native'
import React, { useContext } from 'react'
import authService from '../../libs/appwrite/auth'
import CustomButton from '../../components/CustomButton'
import { router } from 'expo-router'
import { useGlobalContext } from '../../context/GlobalProvider'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'

const Profile = () => {

  const { enableDeviceAdmin, registerBackgroundTask, lockSystem } = useGlobalContext()

  const submit = async () => {
    try {
      authService.logout();
      router.replace("sign-in")
    } catch (e) {
      console.log("ERROR : ", e);

    }
  }

  const handleButton = () => {
    // if(enableDeviceAdmin()){
    //   alert("Device Admin is already enabled");
    // }
    registerBackgroundTask()
  }

  return (
    <SafeAreaView className="bg-olive-BLACK h-full w-full">
      <StatusBar backgroundColor="#2e382e" style="light" />
      <CustomButton
        containerStyle="mt-6"
        title={"Logout"}
        textStyle="text-olive-BLACK"
        // isLoading={isSubmiting}
        handlePress={submit}
      />
      <TouchableOpacity
        className='bg-[#4eb8ff] w-[100%] py-4 mt-10 rounded-full'
        onPress={() => {
          console.log("Admining");
          enableDeviceAdmin();
          // registerBackgroundTask()
          console.log("Admin done");

        }}
      >
        <View>
          <Text className='text-center'>Give Admin Permission</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        className='bg-[#4eb8ff] w-[100%] py-4 mt-10 rounded-full'
        onPress={() => {
          console.log("Task scheduling");
          // enableDeviceAdmin();
          // registerBackgroundTask()
          lockSystem()
          console.log("Task Scheduling done");

        }}
      >
        <View>
          <Text className='text-center'>Lock</Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

export default Profile