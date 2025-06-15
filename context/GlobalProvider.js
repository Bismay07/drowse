import { createContext, useContext, useEffect, useState } from "react";
import authService from "../libs/appwrite/auth";
import { NativeModules, Linking, Alert, Platform } from "react-native";

import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";

// Remove this line
// import { DevicePolicyManager, ComponentName } from 'react-native-device-admin';

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

export default GlobalProvider = ({ children }) => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isToddlerModeActive, setIsToddlerModeActive] = useState(false);

	// Function for enabling admin previledge
	const enableDeviceAdmin = () => {
		try {
			const intent = {
				action: "android.app.action.ADD_DEVICE_ADMIN",
				data: {
					"android.app.extra.DEVICE_ADMIN": new ComponentName(
						"com.bismay.drowse",
						"com.bismay.drowse.DeviceAdminReceiver"
					),
					"android.app.extra.EXPLANATION":
						"This app needs device admin to lock the screen.",
				},
			};

			Linking.sendIntent(intent.action, intent.data);
			// return true
		} catch (e) {
			Alert.alert(
				"Error",
				"Please enable device admin manually in Settings > Security > Device Administrators"
			);
		}
	};

	const isDeviceAdminEnabled = async () => {
		try {
		  const result = await NativeModules.ScreenLock.isAdminActive();
		  return result;
		} catch (e) {
		  console.error("Error checking admin status:", e);
		  return false;
		}
	  };

	// Defining Background task

	const TODDLER_MODE_TASK = "toddler-mode-lock-screen";

	TaskManager.defineTask(TODDLER_MODE_TASK, async () => {
		try {
			if (isToddlerModeActive && NativeModules.ScreenLock) {
				await NativeModules.ScreenLock.lockScreen();
				console.log(
					"Running screen lock task: ",
					BackgroundFetch.BackgroundFetchResult.NewData
				);
				return BackgroundFetch.BackgroundFetchResult.NewData;
			}
			return BackgroundFetch.BackgroundFetchResult.NoData;
		} catch (error) {
			console.error("Toddle mode task error: ", error);
			return BackgroundFetch.BackgroundFetchResult.Failed;
		}
	});

  const startToddlerMode = async () => {
    try {
      setIsToddlerModeActive(true);
      BackgroundFetch.registerTaskAsync(TODDLER_MODE_TASK, {
        minimumInterval: 3,
        stopOnTerminate: false,
        startOnBoot: true,
        // exactAndAllowWhileIdle: true
      }).then(data=>{
        console.log("Activated", isToddlerModeActive);
        
      });
      enableDeviceAdmin()
    } catch (error) {
      console.error("Error starting toddler mode: ", error);
      Alert.alert("Error", "Failed to activate Toddler Mode");
    }
  }

	const stopToddlerMode = async () => {
		try {
			setIsToddlerModeActive(false);
			await BackgroundFetch.unregisterTaskAsync(TODDLER_MODE_TASK);
			Alert.alert("Toddler Mode", "Toddler Mode has been stopped");
		} catch (error) {
			console.error("Error stopping toddler mode: ", error);
		}
	};
	// const BACKGROUND_LOCK_TASK = "background-lock-screen";

	// TaskManager.defineTask(BACKGROUND_LOCK_TASK, async () => {
	//   try {
	//     console.log("Running screen lock task");
	//     if (NativeModules.ScreenLock) {
	//       await NativeModules.ScreenLock.lockScreen();

	//       const usageStats = await new Promise((resolve, reject) => {
	//         NativeModules.ScreenLock.getAppUsageStats(
	//           (result) => resolve(result),
	//           (error) => reject(error)
	//         );
	//       });
	//       console.log("App Usage Stats : ", usageStats);

	//       return BackgroundFetch.BackgroundFetchResult.NewData;
	//     }
	//   } catch (error) {
	//     console.error("Background task error:", error);
	//     return BackgroundFetch.BackgroundFetchResult.Failed;
	//   }
	// });

	const getUsageStats = async () => {
		console.log("clicking");
		// const usageStats = await new Promise((resolve, reject) => {
		//   NativeModules.ScreenLock.getAppUsageStats(
		//     (result) => {
		//       console.log("Raw usage stats:", result);

		//       resolve(result);
		//     },
		//     (error) => {
		//       console.log("ERROR : ", error);

    //       reject(error);
    //     }
    //   );
    // });
    // requestUsageStatsPermission();
    const granted = await NativeModules.ScreenLock.checkUsagePermission()
    console.log(granted);
    

    const stats = await NativeModules.ScreenLock.getAppUsageStats();

		console.log("Stats : ", stats);

		// console.log("App Usage Stats : ", usageStats);
	};

	// const lockSystem = async () => {
	//   try {
	//     // TaskManager.startTask(BACKGROUND_LOCK_TASK);
	//     if (NativeModules.ScreenLock) {
	//       const res = NativeModules.ScreenLock.lockScreen();
	//       if (res.status !== 200) {
	//         Alert.alert("Error", "Failed to lock screen");
	//       }
	//     }
	//     // enableDeviceAdmin();
	//   } catch (e) {
	//     console.log(e);
	//   }
	// };

	const requestUsageStatsPermission = () => {
		if (Platform.OS === "android") {
			try {
				Linking.openSettings();
				Alert.alert(
					"Permission Required",
					'Please enable "Apps with usage access" for this app in Settings > Security.'
				);
			} catch (error) {
				Alert.alert("Error", "Unable to open settings: " + error.message);
			}
		}
	};

	// Registering the background task
	const registerBackgroundTask = async () => {
		const status = BackgroundFetch.getStatusAsync();
		const isRegistered =
			TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCK_TASK);
		console.log(isRegistered);

		if (status === BackgroundFetch.BackgroundFetchStatus.Restricted) {
			console.log("Background execution is restricted");
			return;
		}
		await BackgroundFetch.registerTaskAsync(BACKGROUND_LOCK_TASK, {
			minimumInterval: 10 * 60,
			stopOnTerminate: false,
			startOnBoot: true,
		});
	};

	useEffect(() => {
		const checkUser = async () => {
			try {
				const currentUser = await authService.getCurrentUser();
				if (currentUser) {
					setIsLoggedIn(true);
					setUser(currentUser);
				} else {
					setIsLoggedIn(false);
					setUser(null);
				}
			} catch (error) {
				console.log("Global Provider: ", error);
				setIsLoggedIn(false);
				setUser(null);
			} finally {
				setIsLoading(false);
			}
		};
		checkUser();
	}, []);

	return (
		<GlobalContext.Provider
			value={{
				isLoading,
				isToddlerModeActive,
				isLoggedIn,
				user,
				isDeviceAdminEnabled,
				startToddlerMode,
				stopToddlerMode,
				setIsLoggedIn,
				setUser,
				enableDeviceAdmin,
				registerBackgroundTask,
				getUsageStats,
				requestUsageStatsPermission,
			}}
		>
			{children}
		</GlobalContext.Provider>
	);
};


