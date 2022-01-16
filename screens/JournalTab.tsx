import React, { useEffect, useRef, useState } from "react";
import { Ionicons } from '@expo/vector-icons'; 
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
import { toastConfig } from "../constants/ToastConfig";
import { horizon } from "../constants/Colors";

export default function TabTwoScreen({
  navigation,
}: RootTabScreenProps<"JournalTab">) {
  const colorScheme = useColorScheme();
  let colorValue = 255;
  const dimensions = useWindowDimensions();
  const [textContent, setContent] = React.useState("");
  const [title, setTitle] = React.useState("");
  const top = useSharedValue(dimensions.height);
  const [filter, setFilter] = useState(false);
  const [refresh, activateRefresh] = useState(0);
  const [entries, setEntries] = useState<Array<entryObject>>([]);
  const [searchText, setSearch] = useState('');
  const [tempId, setTempId] = useState(0); //sqlite ids start at 1, so zero should be nothing
  interface entryObject {//query object to hold entries retrived from database result sets
    id: number;
    title: string;
    content: string;
    created_on: string;
  }
  //effect called on refresh or first component render
  React.useEffect(() => {
    //data loading effect
    console.log('effect started, filter is currently: ' + filter);
    if(!filter){
      database.getEntries().then((entryResults) => {
        setEntries(entryResults);
      });
    }
    setTempId(0);
  }, [refresh]);
  //configuration for bottom sheet animation
  const SpringConfig = {
    damping: 80,
    overshootClamping: true,
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
    stiffness: 500,
  };
  //TODO: map a colour to each entry for color-coding
  // const colourMap = {
      
  // }
  //top is the current height of the sheet
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
      //dimensions.height / 4 equates to halfway up the screen on android
      const baseHeight = dimensions.height / 4;
      const upperHeightLimit = baseHeight + 150;
      const lowerHeightLimit = baseHeight - 60;
      //if the top value is close to the middle
      if (top.value <= upperHeightLimit && top.value >= lowerHeightLimit) {
        top.value = dimensions.height / 4; //hides sheet
      } else if (top.value < upperHeightLimit) {
        //at 0, the bottom sheet is full screen
        top.value = 0;
      } else {
        //close the sheet
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
      dimensions.height, //none of the screen
      SpringConfig
    );
  };
  //alert called when about to delete
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
  //function calling database query then refreshing entries
  const removeEntry = (id: number) => {
    database.removeEntry(id).then(() => {
      Toast.show("Entry Removed", toastConfig);
      activateRefresh((value) => (value > 1000 ? 0 : value + 1));
    });
  };
  //helper function for setting content and title during different events
  const setupEntryDetails = (title: string, content: string) => {
    setContent(content);
    setTitle(title);
  };
  //insert notes item
  const insertJournalEntry = () => {
    database.insertEntry(title, textContent).then(() => {
      activateRefresh((value) => (value > 1000 ? 0 : value + 1));
      Toast.show("Entry Created", toastConfig);
      setTitle("");
      setContent("");
    });
  };
  //updates notes when text changes and finalize is pressed
  const updateJournalEntry = (id: number) => {
    database.updateEntry(title, textContent, id).then(() => {
      if(filter){//if the filter is on, then we should refresh that filter in case the update changed the contents
        database.getSearchResults(searchText).then((searchResults) => {
          setEntries(searchResults);
      });
    }
      activateRefresh((value) => (value > 1000 ? 0 : value + 1));
      Toast.show("Entry Updated", toastConfig);
      setTitle("");
      setContent("");
    });
  };
  const searchEntries = () => {
    if(filter){//if filter is true, then this should function as a cancel button
      setFilter(false);
      setSearch('');
      activateRefresh((value) => (value > 1000 ? 0 : value + 1));
      return;
    }
    if(searchText == ''){
      Toast.show('The input needs text to filter by!', toastConfig);
      return;
    }
    database.getSearchResults(searchText).then((searchResults) => {
      setEntries(searchResults);
      setFilter(true); //filter is on
      activateRefresh((value) => (value > 1000 ? 0 : value + 1));
      Toast.show("entries filtered", toastConfig);
    });
  };

  return (
    <View style={styles.container}>
       <View style={styles.flexRow}>
        <TextInput
          onChangeText={(text) => setSearch(text)}
          placeholder="filter by keywords"
          style={styles.searchInput}
          value={searchText}
        />
         <Pressable
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.5 : 1,
            },
            styles.searchButton,
          ]}
          onPress={searchEntries}
        >
          <LinearGradient
            colors={[horizon.darkGray, horizon.mediumGray]}
            style={styles.searchButtonGradient}
          >
            {!filter ? 
            <Ionicons name="filter" size={24} color="white" />
          :
          <Ionicons name="close" size={24} color="white" />
          }
          </LinearGradient>
        </Pressable>
      </View>
      <ScrollView style={styles.scrollContainer}>
        {
        entries.map(({ id, title, content, created_on }) => (
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
              <Text style={styles.textStyle}>{created_on}</Text>
            </LinearGradient>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.flexRow}>
        <Pressable
          onPress={() => {
            setupEntryDetails("", "");
            setTempId(0);
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
            <Text style={styles.textStyle}>Create New Entry</Text>
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
  searchInput: {
    flex: 0,
    textAlign: "center",
    height: 48,
    padding: 8,
    width: '75%',
    backgroundColor: "#FCF5E5",
   
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
  searchButtonGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  searchButton:{
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
