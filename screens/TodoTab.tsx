import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  TextInput,
  Button,
  StyleSheet,
  Platform,
  Pressable,
  ColorSchemeName,
  Alert,
} from "react-native";
import useColorScheme from "../hooks/useColorScheme";
import { Text, View } from "../components/Themed";
import { RootTabScreenProps } from "../types";
import * as Notifications from "expo-notifications";
import { LinearGradient } from "expo-linear-gradient";
import { database } from "../components/Database";
import DateTimePicker from "@react-native-community/datetimepicker";
import {horizon} from '../constants/Colors';
import Toast from 'react-native-root-toast';
import { toastconfig } from '../constants/ToastConfig';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function TabOneScreen({
  navigation,
}: RootTabScreenProps<"TodoTab">) {
  interface queryObject {
    id: number;
    todoname: string;
    notificationid: string;
    reminderdate: string;
  }
  const colorScheme = useColorScheme();
  const [todos, setTodos] = useState<Array<queryObject>>([]);
  const [reminders, setReminders] = useState<Array<queryObject>>([]);
  const [refresh, activateRefresh] = useState(0);
  const [text, setText] = useState("");

  React.useEffect(() => {
    //data loading effect
    database.getReminders().then((reminderResults) => {
      setReminders(reminderResults);
    });
    database.getTodos().then((todoResults) => {
      setTodos(todoResults);
    });
  }, [refresh]);

  //notification logic
  const scheduleNotification = async (currentDate: Date, text: string) => {
    const trigger = currentDate.getTime();
    const resultInSeconds = Math.floor(
      (currentDate.getTime() - Date.now()) / 1000
    );
    const notificationId = Notifications.scheduleNotificationAsync({
      content: {
        title: "Here is your scheduled reminder: ",
        body: text,
        priority: "high",
      },
      trigger,
    });
    console.log("notification scheduled! returning notify id");
    return notificationId;
  };

  const deleteAlert = (id: number, notificationId = "") => {
    Alert.alert(
      "Delete",
      "Would you like to delete this item?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            if (notificationId.length > 0) {
              Notifications.cancelScheduledNotificationAsync(notificationId);
            }

            removeItem(id);
          },
        },
      ],
      { cancelable: false }
    );
  };

  const removeItem = (id: number) => {
    database.removeItem(id).then(() => {
      Toast.show('Todo removed',toastconfig);
      activateRefresh((value) => (value > 1000 ? 0 : value + 1));
    });
  };

  // date picker/reminder code
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState(undefined);
  const [show, setShow] = useState(false);

  const submitDate = (event: any, selectedDate: any) => {
    console.log("date now is : " + Date.now());
    const currentDate = selectedDate || date;
    setShow(Platform.OS === "ios");
    setDate(currentDate);
    console.log("current date is " + selectedDate);
    if (mode === "date") {
      showTimePicker();
    } else if (mode === "time") {
      if (currentDate < Date.now()) {
        console.log("the selected date must be forward in time from now!");
        return;
      }
      const currentDateString = currentDate.toString();
      const dateSections = currentDateString.split(' ' , 5);
      const firstSection = dateSections.slice(0, 4);
      const secondSection = dateSections.slice(4);
      const formattedDate = "Set for: " + firstSection.join(' ') + " at " + secondSection;
      console.log(formattedDate);
      scheduleNotification(currentDate, text).then((notificationid) => {
        console.log("here is the note identifier" + notificationid);
        database
          .insertTodo(text, notificationid, formattedDate)
          .then(() => {
            Toast.show('Reminder added',toastconfig);
            activateRefresh((value) => value + 1);
            setText("");
          });
      });
    }
  };

   //todo insert
   const submitTodo = () => {
    if (text.length === 0) {
      Toast.show('Type something in the input to set it as a To-do',toastconfig);
      return;
    }
    database.insertTodo(text, null, null).then(() => {
      Toast.show('Todo added',toastconfig);
      activateRefresh((value) => (value > 1000 ? 0 : value + 1));
      setText("");
    });
  };

  const showMode = (currentMode: any) => {
    if (text.length === 0) {
      Toast.show('Type something first to set it as a Reminder',toastconfig);
      return;
    }
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode("date");
  };

  const showTimePicker = () => {
    showMode("time");
  };

  return (
    <View style={styles.container}>
      <View style={styles.flexRow}>
        <TextInput
          onChangeText={(text) => setText(text)}
          placeholder="Type something here"
          style={styles.input}
          value={text}
        />
      </View>
      <View style={styles.buttonFlexRow}>
        <Pressable
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.5 : 1,
            },
            styles.button,
          ]}
          onPress={submitTodo}
        >
          <LinearGradient
            colors={[horizon.darkGray, horizon.mediumGray]}
            style={styles.buttonGradient}
          >
            <Text style={styles.textStyle}>Set Todo</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.5 : 1,
            },
            styles.button,
          ]}
          onPress={() => {
            console.log("showing date picker");
            showDatepicker();
          }}
        >
          <LinearGradient
            // Button Linear Gradient
            colors={[horizon.darkGray, horizon.mediumGray]}
            style={styles.buttonGradient2}
          >
            <Text style={styles.textStyle2}>Set Reminder</Text>
          </LinearGradient>
        </Pressable>
      </View>
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={mode}
          is24Hour={true}
          display="spinner"
          minimumDate={new Date()}
          onChange={submitDate}
        >
          <Button onPress={showTimePicker} title="show time"></Button>
        </DateTimePicker>
      )}
      
      <ScrollView>
        {todos.map(({ id, todoname, notificationid, reminderdate }) => (
          <Pressable
            key={`todo-${id}`}
            onLongPress={() => {
              deleteAlert(id);
            }}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.5 : 1,
              },
              styles.item,
            ]}
          >
            <LinearGradient
              colors={[horizon.mediumGray, horizon.darkGray]}
              style={styles.itemGradient}
            >
              <Text style={styles.textStyle}>{todoname}</Text>
            </LinearGradient>
          </Pressable>
        ))}
        <View style={styles.separator}></View>
        {reminders.map(({ id, todoname, notificationid, reminderdate }) => (
          <Pressable
            key={`reminder-${id}`}
            onLongPress={() => {
              deleteAlert(id, notificationid);
            }}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.5 : 1,
              },
              styles.item,
            ]}
          >
            <LinearGradient
              colors={[ horizon.mediumGray, horizon.darkGray]}
              style={styles.itemGradient}
            >
              <Text style={styles.textStyle2}>{todoname}</Text>
              <Text style={styles.textStyle2}>{reminderdate}</Text>
            </LinearGradient>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textStyle: {
    color: horizon.horizonLightPeach,
  },
  textStyle2: {
    color: horizon.deeperPeach,
  },
  
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },

  flexRow: {
    flexDirection: "row",
    
  },
  buttonFlexRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    textAlign: "center",
    height: 48,
    padding: 8,
    backgroundColor: "#FCF5E5",
   
  },
  buttonGradient: {
    flex: 1,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    marginHorizontal: 1,
    borderColor: horizon.horizonMediumPeach,
    borderBottomWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    
  },
  buttonGradient2: {
    flex: 1,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    marginHorizontal: 1,
    borderColor: horizon.horizonDeepPeach,
    borderBottomWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    
  },
  button: {
    flex: 1,
    height: 48,
  },

  itemGradient: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    marginHorizontal: 12,
    borderRadius: 5,
    margin: 12,
    
  },
  item: {
    flex: 1,
  },

  sectionContainer: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  sectionHeading: {
    fontSize: 18,
    marginBottom: 8,
  },
  separator: {
    borderTopColor: horizon.horizonMediumPeach,
    borderTopWidth: 1,
    marginVertical: 20,
    height: 1,
    width: "100%",
  },
  row: {
    padding: 15,
    marginBottom: 5,
    backgroundColor: "skyblue",
  },
  header: {
    padding: 15,
    marginBottom: 5,
    backgroundColor: "steelblue",
    color: "white",
    fontWeight: "bold",
  },
});
