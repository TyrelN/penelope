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
import { toastConfig } from '../constants/ToastConfig';


async function requestPermissionsAsync(){
  return await Notifications.requestPermissionsAsync({
    ios:{
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowAnnouncements: true,

    },
  });
}
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
  interface queryObject {//a query object that each result from the database will be placed into
    id: number;
    todoname: string;
    notificationid: string;
    reminderdate: string;
  }
  //const colorScheme = useColorScheme();
  const [todos, setTodos] = useState<Array<queryObject>>([]);
  const [reminders, setReminders] = useState<Array<queryObject>>([]);
  const [refresh, activateRefresh] = useState(0);
  const [text, setText] = useState("");

  //effect that runs every time the refresh variable is changed, and at the first component render
  React.useEffect(() => {
    //setup permissions for ios
    requestPermissionsAsync();
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
    const resultInSeconds = Math.floor(
      (currentDate.getTime() - Date.now()) / 1000
    );
    //schedule the notification and store the id in this variable
    const notificationId = Notifications.scheduleNotificationAsync({
      content: {
        title: "Here is your scheduled reminder: ",
        body: text,
        priority: "high",
      },
      trigger:{
        seconds: resultInSeconds
      },
    });
    return notificationId;
  };
  //on long press, trigger an alert to confirm deletion
  const deleteAlert = (id: number, notificationId = "") => {
    Alert.alert(
      "Delete",
      "Would you like to delete this item?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            if (notificationId.length > 0) {//if there is a notification id for this item, also cancel that notification
              Notifications.cancelScheduledNotificationAsync(notificationId);
            }
            removeItem(id);
          },
        },
      ],
      { cancelable: false }
    );
  };
  //function that calls database to remove item
  const removeItem = (id: number) => {
    database.removeItem(id).then(() => {
      Toast.show('Todo removed',toastConfig);
      activateRefresh((value) => (value > 1000 ? 0 : value + 1));
    });
  };

  // date picker/reminder code
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState(undefined);
  const [show, setShow] = useState(false);


  const updateDate = (event: any, selectedDate: any) =>{
    setDate(selectedDate || date);
    if(Platform.OS == "android"){
      if (mode === "date") {
        showTimePicker();
      } else if (mode === "time") {
        submitDate();
      }
    }
  }
  const submitDate = () => {
      if (date.getTime() < Date.now()) {
        Toast.show('the selected date must be some time in the future!', toastConfig);
        return;
      }
      const dateSections = date.toString().split(' ' , 5);
      const formattedDate = "Set for: " + dateSections.slice(0,4).join(' ') + " at " + dateSections.slice(4);
      scheduleNotification(date, text).then((notificationid) => {
        database
          .insertTodo(text, notificationid, formattedDate)
          .then(() => {
            Toast.show('Reminder added',toastConfig);
            activateRefresh((value) => value + 1);
            setText("");
            setShow(false);
          });
      });
  };

   //todo insert
   const submitTodo = () => {
    if (text.length === 0) {
      Toast.show('Type something in the input to set it as a To-do',toastConfig);
      return;
    }
    database.insertTodo(text, null, null).then(() => {
      Toast.show('Todo added',toastConfig);
      activateRefresh((value) => (value > 1000 ? 0 : value + 1));
      setText("");
    });
  };

  const showMode = (currentMode: any) => {
    if (text.length === 0) {
      Toast.show('Type something first to set it as a Reminder',toastConfig);
      return;
    }
    setShow(true);
    setMode(currentMode);
  };

  const processDateTimePicking = () => {
    if(Platform.OS === "ios"){
      showMode("datetime");
    }
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
          onPress={() => {!show ? 
            processDateTimePicking()
            :
            submitDate();
          }}
        >
          <LinearGradient
            // Button Linear Gradient
            colors={[horizon.darkGray, horizon.mediumGray]}
            style={styles.buttonGradient2}
          >{!show ? 
            <Text style={styles.textStyle2}>Set Reminder</Text>:
            <Text style={styles.textStyle2}>Apply</Text>
          }
          </LinearGradient>
        </Pressable>
      </View>
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={mode}
          is24Hour={true}
          display="default"
          minimumDate={new Date()}
          onChange={updateDate}
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
