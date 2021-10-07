import { StatusBar } from "expo-status-bar";
import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Image,
  PixelRatio,
  useWindowDimensions,
} from "react-native";
import { formatPhotoUri } from "../components/Picsum";
import { Text, View } from "../components/Themed";
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import {
  PanGestureHandler,
  PinchGestureHandler,
} from "react-native-gesture-handler";

export default function PhotoDetailScreen({ route, navigation }) {
  const { height, width } = useWindowDimensions();
  const { photo } = route.params;
  const ratio = PixelRatio.getPixelSizeForLayoutSize(width);
  const scale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);
  const panX = useSharedValue(0);
  const panY = useSharedValue(0);
  const [photoData, setData] = useState({});
  const AnimatedImage = Animated.createAnimatedComponent(Image);

  const fetchPhotoDetails = async () => {
    try {
      const response = await fetch(`https://picsum.photos/id/${photo}/info`);
      const photoDetails = await response.json();
      setData(photoDetails);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPhotoDetails();
  }, []);

  const pinchHandler = useAnimatedGestureHandler({
    onStart: (event, context) => {
      context.startScale = scale.value;
    },
    onActive: (event, context) => {
      scale.value = context.startScale * event.scale;
      if (context.startScale < 2) {
        focalX.value = event.focalX;
        focalY.value = event.focalY;
      }
    },
    onEnd: (event, context) => {
      if (scale.value < 0.9) {
        scale.value = withTiming(1);
      }
    },
  });

  const panHandler = useAnimatedGestureHandler({
    onStart: (event, context) => {
      context.startX = panX.value;
      context.startY = panY.value;
    },
    onActive: (event, context) => {
      panX.value = context.startX + event.translationX;
      panY.value = context.startY + event.translationY;
    },
    onEnd: (event, context) => {
      if (scale.value < 0.9) {
        scale.value = withTiming(1);
      }
    },
  });

  const imageAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [
        //trick to center screen while focusing pinches within image.
        //pan logic
        { translateX: panX.value },
        { translateY: panY.value },
        //zoom logic
        { translateX: focalX.value },
        { translateY: focalY.value },
        { translateX: -(width / 2) },
        { translateY: -(height / 2) },
        { scale: scale.value },
        { translateX: -focalX.value },
        { translateY: -focalY.value },
        { translateX: width / 2 },
        { translateY: height / 2 },
      ],
    };
  });
  //debug animated view
  const debugPointStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: focalX.value }, { translateY: focalY.value }],
    };
  });

  return (
    <PanGestureHandler
      onGestureEvent={panHandler}
      simultaneousHandlers={pinchHandler}
    >
      <Animated.View style={[{ flex: 1 }]}>
        <PinchGestureHandler
          onGestureEvent={pinchHandler}
          simultaneousHandlers={panHandler}
        >
          <Animated.View style={[{ flex: 1 }]}>
            <AnimatedImage
              style={[styles.image, imageAnimStyle]}
              source={{
                uri: formatPhotoUri(
                  Number(photo),
                  photoData.width,
                  photoData.height
                ),
              }}
            />
            {/* <Animated.View style={[styles.debugFocalPoint, debugPointStyle]}/> */}
          </Animated.View>
        </PinchGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    resizeMode: "contain",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  image: {
    flex: 1,
    resizeMode: "center",
  },
  wrapper: {
    flex: 1,
  },
  debugFocalPoint: {
    ...StyleSheet.absoluteFillObject,
    width: 20,
    height: 20,
    backgroundColor: "blue",
    borderRadius: 10,
  },
});
