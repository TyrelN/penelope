import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  TextInput,
  StyleSheet,
  Platform,
  Pressable,
  useWindowDimensions,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import useColorScheme from "../hooks/useColorScheme";
import { Text, View } from "../components/Themed";
import { RootTabScreenProps } from "../types";
import { database } from "../components/Database";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Toast from "react-native-root-toast";
import { toastconfig } from "../constants/ToastConfig";
import { horizon } from "../constants/Colors";

export default function TabTwoScreen({
  navigation,
}: RootTabScreenProps<"JournalTab">) {
  const colorScheme = useColorScheme();
  const dimensions = useWindowDimensions();
  const [textContent, setContent] = React.useState("");
  const [title, setTitle] = React.useState("");
  const top = useSharedValue(dimensions.height);
  const [refresh, activateRefresh] = useState(0);
  const [entries, setEntries] = useState<Array<entryObject>>([]);
  const [tempId, setTempId] = useState(0); //sqlite ids start at 1, so zero should be nothing
  interface entryObject {
    id: number;
    title: string;
    content: string;
  }

  React.useEffect(() => {
    //data loading effect
    database.getEntries().then((entryResults) => {
      setEntries(entryResults);
    });
    setTempId(0);
  }, [refresh]);

  const SpringConfig = {
    damping: 80,
    overshootClamping: true,
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
    stiffness: 500,
  };

  const sheetStyle = useAnimatedStyle(() => {
    return {
      top: withSpring(top.value, SpringConfig),
    };
  });
  const gestureHandler = useAnimatedGestureHandler({
    onStart(_, context: any) {
      context.startTop = top.value;
    },
    onActive(event, context: any) {
      top.value = context.startTop + event.translationY;
    },
    onEnd() {
      const baseHeight = dimensions.height / 4;
      const upperHeightLimit = baseHeight + 150;
      const lowerHeightLimit = baseHeight - 60;
      if (top.value <= upperHeightLimit && top.value >= lowerHeightLimit) {
        top.value = dimensions.height / 4; //hides sheet
      } else if (top.value < upperHeightLimit) {
        top.value = 0;
      } else {
        // the drag height must be h
        top.value = dimensions.height;
      }
    },
  });

  const openSheet = () => {
    top.value = withSpring(
      dimensions.height / 4, //half of screen
      SpringConfig
    );
  };
  const closeSheet = () => {
    top.value = withSpring(
      dimensions.height, //half of screen
      SpringConfig
    );
  };

  const deleteAlert = (id: number, notificationId = "") => {
    Alert.alert(
      "Delete",
      "Would you like to delete this journal entry?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            removeEntry(id);
          },
        },
      ],
      { cancelable: false }
    );
  };

  const removeEntry = (id: number) => {
    database.removeEntry(id).then(() => {
      Toast.show("Entry Removed", toastconfig);
      activateRefresh((value) => (value > 1000 ? 0 : value + 1));
    });
  };
  const setupEntryDetails = (title: string, content: string) => {
    setContent(content);
    setTitle(title);
  };

  const insertJournalEntry = () => {
    database.insertEntry(title, textContent).then(() => {
      activateRefresh((value) => (value > 1000 ? 0 : value + 1));
      Toast.show("Entry Created", toastconfig);
      setTitle("");
      setContent("");
    });
  };
  const updateJournalEntry = (id: number) => {
    database.updateEntry(title, textContent, id).then(() => {
      activateRefresh((value) => (value > 1000 ? 0 : value + 1));
      Toast.show("Entry Updated", toastconfig);
      setTitle("");
      setContent("");
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {entries.map(({ id, title, content }) => (
          <Pressable
            key={`entry-${id}`}
            onPress={() => {
              setupEntryDetails(title, content);
              setTempId(id);
              openSheet();
            }}
            onLongPress={() => {
              deleteAlert(id);
            }}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.5 : 1,
              },
              styles.entry,
            ]}
          >
            <LinearGradient
              colors={[horizon.horizonMediumPeach, horizon.horizonDeepPeach]}
              style={styles.entryGradient}
            >
              <Text style={styles.textStyle}>{title}</Text>
            </LinearGradient>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.flexRow}>
        <Pressable
          onPress={() => {
            setupEntryDetails("", "");
            openSheet();
          }}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.5 : 1,
            },
            styles.button1,
          ]}
        >
          <LinearGradient
            colors={[horizon.mediumGray, horizon.darkGray]}
            style={styles.buttonGradient}
          >
            <Text style={{ color: "#FBFAF5" }}>Create New Entry</Text>
          </LinearGradient>
        </Pressable>
      </View>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View
          style={[
            {
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#FCF5E5",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              elevation: 5,
              paddingVertical: 12,
              justifyContent: "center",
              alignItems: "center",
            },
            sheetStyle,
          ]}
        >
          <TextInput
            onChangeText={(text: string) => setTitle(text)}
            placeholder="Entry Title"
            style={styles.titleInput}
            value={title}
          />
          <TextInput
            onChangeText={(text: string) => setContent(text)}
            multiline
            placeholder="Entry Contents"
            numberOfLines={4}
            style={styles.contentInput}
            value={textContent}
          />
          <View style={styles.flexRowButtons}>
            <Pressable
              onPress={() => {
                if (textContent.length > 0 && title.length > 0) {
                  if (tempId > 0) {
                    updateJournalEntry(tempId);
                    closeSheet();
                  } else {
                    insertJournalEntry();
                    closeSheet();
                  }
                } else {
                  closeSheet();
                  Toast.show("An Entry needs a title and content!", {
                    duration: Toast.durations.LONG,
                  });
                }
              }}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.5 : 1,
                },
                styles.buttonFinalize,
              ]}
            >
              <Text style={{ color: "#FBFAF5" }}>Finalize</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                closeSheet();
                setContent("");
                setTitle("");
              }}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.5 : 1,
                },
                styles.buttonCancel,
              ]}
            >
              <Text style={{ color: "#FBFAF5" }}>Cancel</Text>
            </Pressable>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  separator: {
    borderTopColor: "#ffcba4",
    borderTopWidth: 1,
    paddingVertical: 30,

    width: "100%",
  },
  contentInput: {
    flex: 1,
    textAlignVertical: "top",
    padding: 6,
    marginHorizontal: 12,
    width: 300,
    height: "70%",
    backgroundColor: "#ede1d3",
  },
  titleInput: {
    flex: 0,
    textAlign: "center",
    width: 300,
    marginTop: 25,
    height: 40,
    padding: 1,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    backgroundColor: "#ede1d3",
    borderBottomColor: horizon.darkGray,
    borderBottomWidth: 2,
  },
  textStyle: {
    color: "#181A18",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  entry: {
    flex: 1,
  },
  entryGradient: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#d0ccc3",
    padding: 12,
    margin: 12,
    borderRadius: 5,
  },
  flexRow: {
    flexDirection: "row",
  },
  flexRowButtons: {
    flex: 0,
    backgroundColor: "#ede1d3",
    flexDirection: "row",
    textAlign: "center",
    width: 300,
    height: "8%",
  },
  buttonGradient: {
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
    paddingVertical: 30,

    height: 48,
    padding: 8,
    backgroundColor: "#232530",
  },
  button1: {
    flex: 1,
  },
  buttonFinalize: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "70%",
    height: 38,
    padding: 8,
    backgroundColor: horizon.darkGray,
    borderColor: "#ede1d3",
    borderWidth: 1,
    borderRadius: 10,
  },
  buttonCancel: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "30%",
    height: 38,
    padding: 8,
    backgroundColor: horizon.darkGray,
    borderColor: "#ede1d3",
    borderWidth: 1,
    borderRadius: 10,
  },
});
