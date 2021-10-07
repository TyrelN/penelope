//reference: https://www.naroju.com/how-to-use-react-context-to-pass-database-reference-to-child-components/
import  React, { useReducer, useState } from 'react';
import Constants from "expo-constants";
import { Platform } from 'react-native';
//import connect, {sql} from '@databases/expo';
import * as SQLite from "expo-sqlite";

function openDatabase() {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        };
      },
    };
  }
  const db = SQLite.openDatabase("db.db");
  return db;
}
const db = openDatabase();

const insertTodo = (todoname, notificationid, reminderdate) =>{
  return new Promise((resolve, reject)=>{
  db.transaction((tx)=>{
    tx.executeSql(`
          insert into todos (todoname, notificationid, reminderdate)
          values (?, ?, ?)
        `, [todoname, notificationid, reminderdate],
        );
      },
      null,
     ()=>{resolve('item successfully added!')}
  );
})
} 

const insertEntry = (title, content) =>{
  return new Promise((resolve, reject)=>{
  db.transaction((tx)=>{
    tx.executeSql(`
          insert into entries (title, content)
          values (?, ?)
        `, [title, content],
        );
      },
      null,
     ()=>{resolve('item successfully added!')}
  );
})
} 

const updateEntry = (title, content, id) =>{
  return new Promise((resolve, reject)=>{
  db.transaction((tx)=>{
    tx.executeSql(`
          update entries set title = ?, content = ? where id = ?;`, [title, content, id],
        );
      },
      null,
     ()=>{resolve('item successfully added!')}
  );
})
} 

     const setupTables= async () =>{
       return new Promise((resolve, reject)=>{
        db.transaction((tx) => {
          tx.executeSql(`create table if not exists todos (id integer primary key not null, todoname text not null, notificationid text, reminderdate text);`);
  
          tx.executeSql(`create table if not exists entries (id integer primary key not null, title text not null, content text not null);`);
        },
          null,
          () => { resolve('the tables promise worked'); }
        );
       })
     }

      const getReminders = async () => {
        return new Promise((resolve, reject)=>{
         db.transaction((tx)=>{
          tx.executeSql('select * from todos where notificationid is not null',
          [],//just pass empty arguments since no variables used
          (_, { rows: { _array } }) => {resolve(_array)}
              );
            },
            null,
            ()=>{}
           );
          })
      }

      
      const getEntries = async () => {
        return new Promise((resolve, reject)=>{
         db.transaction((tx)=>{
          tx.executeSql('select * from entries',
          [],//just pass empty arguments since no variables used
          (_, { rows: { _array } }) => {resolve(_array)}
              );
            },
            null,
            ()=>{}
           );
          })
      }


      const getTodos = async () => {
        return new Promise((resolve, reject)=>{
        db.transaction((tx)=>{
          tx.executeSql('select * from todos where notificationid is null',
          [],//just pass empty arguments since no variables used
          (_, { rows: { _array} }) => {resolve(_array)}
              );
            },
            null,
        ()=>{}
           );
          })
      }

      
      const removeItem = async (id) => {
        return new Promise((resolve, reject)=>{
        db.transaction((tx)=>{
          tx.executeSql('delete from todos where id = ?;',
          [id]
              );
            },
            null,
        ()=>{ resolve('item removed!');}
           );
          })
      }

      const removeEntry = async (id) => {
        return new Promise((resolve, reject)=>{
        db.transaction((tx)=>{
          tx.executeSql('delete from entries where id = ?;',
          [id]
              );
            },
            null,
        ()=>{ resolve('entry removed!');}
           );
          })
      }
    
    export const database = {
      insertTodo,
      getReminders,
      getTodos,
      removeItem,
      setupTables,
      getEntries,
      insertEntry,
      updateEntry,
      removeEntry,
    }