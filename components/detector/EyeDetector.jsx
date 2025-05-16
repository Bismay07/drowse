import { View, Text, Alert, Button } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
  Camera,
} from "react-native-vision-camera";
import {
  useFaceDetector,
  FaceDetectionOptions,
} from "react-native-vision-camera-face-detector";
import { useRunOnJS, Worklets } from "react-native-worklets-core";
import * as Brightness from 'expo-brightness'

const FOCAL_LENGTH = 1200
const ACTUAL_EYE_DISTANCE = 5
const TIMEOUT_INTERVAL = 3000;
const MIN_DISTANCE = 30; // Minimum safe distance in cm
const MAX_DISTANCE = 150


const EyeDetector = () => {
  const faceDetectionOption = useRef < FaceDetectionOptions > ({
    trackingEnabled: true,
    landmarkMode: 'all'
  }).current;
  const device = useCameraDevice("front");
  const [isScreenTimeout, setIsScreenTimeout] = useState(false);
  const timeoutRef = useRef(null);
  const { hasPermission, requestPermission } = useCameraPermission();
  const { detectFaces } = useFaceDetector({
    landmarkMode: 'all',
    performanceMode: 'fast',
    trackingEnabled: true,

  });
  const [bright, setBright] = useState(1.0)

  // Handle camera permission
  useEffect(() => {
    if (!hasPermission) {
      requestPermission().then((status) => {
        console.log("Camera permission status:", status);
      });
      Brightness.requestPermissionsAsync().then((status) => {
        console.log("Brightness permission status:", status);

      }).catch(e => {
        console.log("Brightness Permission erro : ", e);

      })
    }
  }, [hasPermission, requestPermission]);

  // useEffect(() => {
  //   updateBrightness(bright)
  // }, [handleDetectedFaces])

  useEffect(() => {
    return () => {
      Brightness.setSystemBrightnessAsync(1.0);
      clearTimeout(timeoutRef.current);
    }; x``
  }, [])

  const updateBrightness = async (brightness) => {
    try {
      await Brightness.setSystemBrightnessAsync(brightness)
      console.log("Brightness set to : ", brightness);

    } catch (e) {
      console.error("Failed to set brightness : ", e);

    }
  }


  // Define handleDetectedFaces as a worklet
  const handleDetectedFaces = Worklets.createRunOnJS((faces) => {
    'worklet';
    // console.log("Faces detected:", faces);
    const { landmarks } = faces[0]
    const { LEFT_EYE, RIGHT_EYE } = landmarks
    // console.log(`Left Eye: (${LEFT_EYE.x}, ${LEFT_EYE.y}), Right Eye: (${RIGHT_EYE.x}, ${LEFT_EYE.y})`);
    if (LEFT_EYE && RIGHT_EYE) {
      const pixelDistace = Math.sqrt(
        Math.pow(RIGHT_EYE.x - LEFT_EYE.x, 2) + Math.pow(RIGHT_EYE.y - LEFT_EYE.y, 2)
      )
      const estimateDistance = ((ACTUAL_EYE_DISTANCE * FOCAL_LENGTH) / pixelDistace)
      console.log(`Estimate Eye Distance : ${estimateDistance}`);


      let brightness = 1.0
      if (estimateDistance < MIN_DISTANCE) {
        brightness = 0.1
        // setBright(bright)
        console.log("Too close");

        startScreenTimeout();
        Alert.alert('Warning', 'You are too close to the screen!');

      } else if (estimateDistance < MAX_DISTANCE) {
        brightness = 0.1 + 0.9 * ((estimateDistance - MIN_DISTANCE) / (MAX_DISTANCE - MIN_DISTANCE))
        // Brightness.setSystemBrightnessAsync(brightness).then((data) => {
        // })
        // setBright(bright)
        console.log("Brightness : ", brightness);
        clearTimeout(timeoutRef.current);
      } else {
        clearTimeout(timeoutRef.current);
      }
      console.log("reached");

      // Brightness.setSystemBrightnessAsync(brightness).then(data => {
      //   console.log("Brightness updated");
      // }).catch(e => {
      //   console.log("Failed to update brightness : ", e);

      // })
      Brightness.setSystemBrightnessAsync(brightness).then(data => {
        console.log("Updated", data);

      }).catch(e => {
        console.error("Error : ", e);

      })
      // setBright(brightness)
      // updateBrightness(brightness)

      // Worklets.createRunOnJS(updateBrightness(brightness))
      console.log('crossed');

    }
  });

  const startScreenTimeout = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsScreenTimeout(true);
      Brightness.setSystemBrightnessAsync(0);
      Alert.alert('Screen Timeout', 'Screen turned off due to close proximity.');
    }, TIMEOUT_INTERVAL);
  };

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      const faces = detectFaces(frame);
      handleDetectedFaces(faces);
      // updateBrightness(bright)
    },
    [handleDetectedFaces]
  );

  if (!device || !hasPermission) {
    return (
      <View>
        <Text>{!device ? "No front camera found" : "Camera permission denied"}</Text>
      </View>
    );
  }

  return (
    <View>
      <Camera
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        pixelFormat="yuv"
      />
      <Button onPress={() => {
        Brightness.setSystemBrightnessAsync(0.5).then(d => {
          console.log("Done");
        }).catch(e => {
          console.log("Error : ", e);

        })
      }} title="Update brightness 50" />
    </View>
  );
};

export default EyeDetector;