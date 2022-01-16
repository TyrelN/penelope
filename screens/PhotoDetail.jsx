//pinchgesture code reference: https://www.youtube.com/watch?v=R7vyLItMQJw
import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Image,
  useWindowDimensions,
} from "react-native";
import { formatPhotoUri } from "../components/Picsum";
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
  const { photo } = route.params;//retrieve the passed photo id 
 // const ratio = PixelRatio.getPixelSizeForLayoutSize(width);
  const scale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);
  const panX = useSharedValue(0);
  const panY = useSharedValue(0);
  const [photoData, setData] = useState({});
  const AnimatedImage = Animated.createAnimatedComponent(Image);

  const fetchPhotoDetails = async () => {//set the photo details given by the route parameter id
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
      //context allows current scale to be factored in during onActive
      context.startScale = scale.value;
    },
    onActive: (event, context) => {
      scale.value = context.startScale * event.scale;//scale relative to the current scale
      if (context.startScale < 2) { //only allow focused transforms if the image isn't zoomed in by more than 2 x
        focalX.value = event.focalX;
        focalY.value = event.focalY;
      }
    },
    onEnd: (event, context) => {
      //resize the image back to normal if at a small enough scale after pinch
      if (scale.value < 0.9) {
        scale.value = withTiming(1);
      }
    },
  });
  //events that cover handling one touch panning
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
  //the logic for actually tranforming the image based on shared Values
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
