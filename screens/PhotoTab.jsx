import React, { useEffect, useReducer, useCallback } from "react";
import { ActivityIndicator, StyleSheet, Button, Pressable } from "react-native";
import Colors from "../constants/Colors";
import { getList } from "../components/Picsum";
import {
  actionCreators,
  initialState,
  reducer,
  types,
} from "../reducers/Photos";
import PhotoGrid from "../components/PhotoGrid";
import useColorScheme from "../hooks/useColorScheme";
import { Text, View } from "../components/Themed";

export default function TabThreeScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const [state, dispatch] = useReducer(reducer, initialState);

  const { photos, nextPage, loading, error } = state;

  const fetchPhotos = useCallback(async () => {
    //fetchPhotos is async so useCallback is necessary to ensure the values read are up-to-date
    dispatch(actionCreators.loading());

    try {
      const nextPhotos = await getList(nextPage);
      dispatch(actionCreators.success(nextPhotos, nextPage));
    } catch (e) {
      dispatch(actionCreators.failure());
    }
  }, [nextPage]);

  useEffect(() => {
    fetchPhotos();
  }, []);
  // We'll show an error only if the first page fails to load
  if (photos.length === 0) {
    if (loading) {
      return (
        <View style={styles.container}>
          <ActivityIndicator animating={true} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.container}>
          <Text>Failed to load photos!</Text>
        </View>
      );
    }
  }

  return (
    <PhotoGrid
      numColumns={3}
      photos={photos}
      onEndReached={fetchPhotos}
      navigation={navigation}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
