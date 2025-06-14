import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, Alert, Button, StyleSheet } from 'react-native';
import {
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
  Camera,
} from 'react-native-vision-camera';
import {
  useFaceDetector,
  FaceDetectionOptions,
} from 'react-native-vision-camera-face-detector';
import { Worklets } from 'react-native-worklets-core';
import * as Brightness from 'expo-brightness';
import { useSharedValue, useAnimatedReaction, withTiming, runOnJS } from 'react-native-reanimated';

// Constants
const FOCAL_LENGTH = 1200;
const ACTUAL_EYE_DISTANCE = 5;
const TIMEOUT_INTERVAL = 3000000; // 50 minutes
const MIN_DISTANCE = 30; // cm
const MAX_DISTANCE = 150; // cm
const MIN_BRIGHTNESS = 0.1;
const MAX_BRIGHTNESS = 1.0;
const BRIGHTNESS_UPDATE_INTERVAL = 3000; // 3 seconds
const BRIGHTNESS_CHANGE_THRESHOLD = 0.05; // Minimum change to update
const BRIGHTNESS_TRANSITION_DURATION = 5; // ms for smooth transition

// Clamped brightness setter
const setBrightnessOnJS = async (value) => {
  try {
    const clampedValue = Math.max(MIN_BRIGHTNESS, Math.min(MAX_BRIGHTNESS, value));
    console.log(`[Brightness] Setting brightness to: ${clampedValue}`);
    await Brightness.setSystemBrightnessAsync(clampedValue);
    console.log("[Brightness] Updated");

    return true;
  } catch (error) {
    console.error('[Brightness] Error setting brightness:', error);
    return false;
  }
};

export default function EyeDetector() {
  const faceDetectionOption = useRef < FaceDetectionOptions > ({
    trackingEnabled: true,
    landmarkMode: 'all',
    minDetectionInterval: 100, // Reduce CPU load
  }).current;
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [hasAllPermissions, setHasAllPermissions] = useState(null);
  const [distance, setDistance] = useState(null);
  const [isScreenTimeout, setIsScreenTimeout] = useState(false);
  const timeoutRef = useRef(null);
  const currentBrightness = useSharedValue(MAX_BRIGHTNESS); // Numeric value (1.0)
  const brightnessValue = useSharedValue(MAX_BRIGHTNESS); // Numeric value (1.0)
  const lastUpdateTime = useSharedValue(0);

  const { detectFaces } = useFaceDetector({
    landmarkMode: 'all',
    performanceMode: 'fast',
    trackingEnabled: true,
  });

  // Request permissions
  const requestAllPermissions = useCallback(async () => {
    try {
      const cameraStatus = hasPermission ? 'granted' : await requestPermission() ? 'granted' : 'denied';
      const brightnessPermission = await Brightness.getPermissionsAsync();
      let brightnessStatus = brightnessPermission.status;
      if (brightnessStatus === 'undetermined') {
        const newPermission = await Brightness.requestPermissionsAsync();
        brightnessStatus = newPermission.status;
      }

      console.log(`[Permissions] Camera permission: ${cameraStatus}`);
      console.log(`[Permissions] Brightness permission: ${brightnessStatus}`);

      const permissionsGranted = cameraStatus === 'granted' && brightnessStatus === 'granted';
      setHasAllPermissions(permissionsGranted);

      if (permissionsGranted) {
        const success = await setBrightnessOnJS(MAX_BRIGHTNESS);
        if (success) {
          currentBrightness.value = MAX_BRIGHTNESS;
          brightnessValue.value = MAX_BRIGHTNESS;
          console.log(`[Permissions] Initial brightness set to ${MAX_BRIGHTNESS}`);
        } else {
          throw new Error('Failed to set initial brightness');
        }
      } else {
        Alert.alert(
          'Permissions Denied',
          'Camera and brightness permissions are required.',
          [{ text: 'Retry', onPress: requestAllPermissions }]
        );
      }
    } catch (error) {
      console.error('[Permissions] Error requesting permissions:', error);
      setHasAllPermissions(false);
      Alert.alert('Error', 'Failed to request permissions.', [
        { text: 'Retry', onPress: requestAllPermissions },
      ]);
    }
  }, [hasPermission, requestPermission]);

  // Initialize permissions
  useEffect(() => {
    if (hasAllPermissions === null) {
      requestAllPermissions();
    }
  }, [hasAllPermissions, requestAllPermissions]);

  // Smooth brightness transition
  const smoothBrightnessTransition = useCallback((targetBrightness) => {
    if (typeof targetBrightness !== 'number' || isNaN(targetBrightness)) {
      console.error(`[Brightness] Invalid targetBrightness: ${targetBrightness}`);
      return;
    }
    const diff = Math.abs(targetBrightness - currentBrightness.value);
    console.log(`[Brightness] Transition check: target=${targetBrightness}, current=${currentBrightness.value}, diff=${diff}`);
    if (diff < BRIGHTNESS_CHANGE_THRESHOLD) {
      console.log('[Brightness] Skipping update: change too small');
      return;
    }
    console.log(`[Brightness] Starting transition to: ${targetBrightness}`);
    console.log(`[Brightness] brightnessValue.value before: ${brightnessValue.value}`);
    brightnessValue.value = withTiming(targetBrightness, {
      duration: BRIGHTNESS_TRANSITION_DURATION,
    });
    console.log(`[Brightness] brightnessValue.value after: ${brightnessValue.value}`);
  }, [brightnessValue, currentBrightness]);

  // Reanimated reaction to update brightness
  useAnimatedReaction(
    () => brightnessValue.value,
    (newBrightness) => {
      if (typeof newBrightness !== 'number' || isNaN(newBrightness)) {
        console.error(`[Reanimated] Invalid newBrightness: ${newBrightness}`);
        runOnJS(setBrightnessOnJS)(MAX_BRIGHTNESS);
        currentBrightness.value = MAX_BRIGHTNESS;
        brightnessValue.value = MAX_BRIGHTNESS;
        return;
      }
      console.log(`[Reanimated] Reaction triggered with brightness: ${newBrightness}`);
      runOnJS(setBrightnessOnJS)(newBrightness);
      currentBrightness.value = newBrightness;
    },
    []
  );

  // Start screen timeout
  const startScreenTimeout = useCallback(() => {
    console.log('[Timeout] Starting screen timeout');
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      console.log('[Timeout] Screen timeout triggered');
      setIsScreenTimeout(true);
      setBrightnessOnJS(0);
      Alert.alert('Screen Timeout', 'Screen turned off due to close proximity.');
    }, TIMEOUT_INTERVAL);
  }, []);

  // Fallback brightness update
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!hasAllPermissions || isScreenTimeout) return;
      console.log(`[Fallback] Checking brightness: ${currentBrightness.value}`);
      const success = await setBrightnessOnJS(currentBrightness.value);
      if (!success) {
        console.log('[Fallback] Retrying brightness set');
        await setBrightnessOnJS(MAX_BRIGHTNESS);
        currentBrightness.value = MAX_BRIGHTNESS;
        brightnessValue.value = MAX_BRIGHTNESS;
      }
    }, BRIGHTNESS_UPDATE_INTERVAL * 2);
    return () => clearInterval(interval);
  }, [hasAllPermissions, isScreenTimeout, currentBrightness, brightnessValue]);

  // Handle face detection
  const handleDetectedFaces = Worklets.createRunOnJS((faces) => {
    console.log(`[Faces] handleDetectedFaces called with ${faces.length} faces`);
    const now = Date.now();
    if (now - lastUpdateTime.value < BRIGHTNESS_UPDATE_INTERVAL) {
      console.log('[Faces] Skipping: interval not elapsed');
      return;
    }
    lastUpdateTime.value = now;

    if (faces.length === 0) {
      console.log('[Faces] No faces detected');
      runOnJS(setDistance)(null);
      runOnJS(smoothBrightnessTransition)(MAX_BRIGHTNESS);
      runOnJS(clearTimeout)(timeoutRef.current);
      return;
    }

    try {
      const { landmarks } = faces[0];
      const { LEFT_EYE, RIGHT_EYE } = landmarks;

      if (!LEFT_EYE || !RIGHT_EYE) {
        console.log('[Faces] Eyes not detected');
        runOnJS(setDistance)(null);
        runOnJS(smoothBrightnessTransition)(MAX_BRIGHTNESS);
        runOnJS(clearTimeout)(timeoutRef.current);
        runOnJS(Alert.alert)('Error', 'Eyes not detected. Please face the camera.');
        return;
      }

      const pixelDistance = Math.sqrt(
        Math.pow(RIGHT_EYE.x - LEFT_EYE.x, 2) + Math.pow(RIGHT_EYE.y - LEFT_EYE.y, 2)
      );
      console.log(`[Faces] Pixel distance: ${pixelDistance}`);

      if (pixelDistance <= 0) {
        console.log('[Faces] Invalid pixel distance, skipping');
        runOnJS(setDistance)(null);
        runOnJS(smoothBrightnessTransition)(MAX_BRIGHTNESS);
        runOnJS(clearTimeout)(timeoutRef.current);
        return;
      }

      const estimateDistance = (ACTUAL_EYE_DISTANCE * FOCAL_LENGTH) / pixelDistance;
      console.log(`[Faces] Estimated distance: ${estimateDistance}`);
      runOnJS(setDistance)(estimateDistance);

      let targetBrightness = MAX_BRIGHTNESS;
      if (estimateDistance < MIN_DISTANCE) {
        targetBrightness = MIN_BRIGHTNESS;
        runOnJS(Alert.alert)('Warning', 'You are too close to the screen!');
        runOnJS(startScreenTimeout)();
      } else if (estimateDistance < MAX_DISTANCE) {
        targetBrightness =
          MIN_BRIGHTNESS +
          (MAX_BRIGHTNESS - MIN_BRIGHTNESS) * ((estimateDistance - MIN_DISTANCE) / (MAX_DISTANCE - MIN_DISTANCE));
        runOnJS(clearTimeout)(timeoutRef.current);
      } else {
        runOnJS(clearTimeout)(timeoutRef.current);
      }

      console.log(`[Faces] Target brightness: ${targetBrightness}`);
      runOnJS(smoothBrightnessTransition)(targetBrightness);
    } catch (error) {
      console.error('[Faces] Error in handleDetectedFaces:', error);
      runOnJS(setDistance)(null);
      runOnJS(smoothBrightnessTransition)(MAX_BRIGHTNESS);
      runOnJS(clearTimeout)(timeoutRef.current);
    }
  });

  // Frame processor
  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      try {
        console.log('[Frame] Frame processor running');
        const faces = detectFaces(frame);
        handleDetectedFaces(faces);
      } catch (error) {
        console.error('[Frame] Error in frameProcessor:', error);
      }
    },
    [handleDetectedFaces]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('[Cleanup] Cleaning up EyeDetector');
      clearTimeout(timeoutRef.current);
      setBrightnessOnJS(0.5).catch((error) => console.error('[Cleanup] Brightness error:', error));
    };
  }, []);

  // Permission UI
  if (hasAllPermissions === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.infoText}>Checking permissions...</Text>
      </View>
    );
  }

  if (hasAllPermissions === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Camera or brightness permission required</Text>
        <Button onPress={requestAllPermissions} title="Grant Permissions" />
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No front camera found</Text>
      </View>
    );
  }

  return (
    <View className='bg-[#ffffff] mt-4 items-center py-4 mx-4 rounded-2xl px-4'>
      <Camera
        device={device}
        isActive={!isScreenTimeout}
        frameProcessor={frameProcessor}
        pixelFormat="yuv"
      // style={styles.camera}
      />
      <Text style={styles.distanceText}>
        Distance: {distance ? `${distance.toFixed(1)} cm` : 'Not detected'}
      </Text>
      <Text style={styles.brightnessText}>
        Brightness: {currentBrightness.value.toFixed(2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  camera: {
    width: '100%',
    height: '80%',
  },
  distanceText: {
    fontSize: 18,
    marginTop: 10,
  },
  brightnessText: {
    fontSize: 18,
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 20,
  },
});