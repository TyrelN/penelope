
import React, { useReducer, useState } from "react";
import Constants from "expo-constants";
import { Platform } from "react-native";
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

const setupTables = async () => {
  return new Promise((resolve) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `create table if not exists todos (id integer primary key not null, todoname text not null, notificationid text, reminderdate text);`
        );
        console.log("table setup log");
        tx.executeSql(
          `create table if not exists entries (id integer primary key not null, title text not null, content text not null, created_on text);`
        );

        tx.executeSql(
          `create table if not exists versions (version integer not null)`
        );
      },
      null,
      () => {
        resolve("the tables promise worked");
      }
    );
  });
};

const dropTables = async () => {
  //destructive function for wiping all tables
  return new Promise((resolve) => {
    db.transaction(
      (tx) => {
        tx.executeSql(`drop table if exists todos`);

        tx.executeSql(`drop table if exists entries`);

        tx.executeSql(`drop table if exists versions`);
      },
      null,
      () => {
        resolve("tables deleted");
      }
    );
  });
};

const setupVersions = async () => {
  let currentVersion = 0; //pre release version is 0
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "select * from versions",
          [], //just pass empty arguments since no variables used
          (_, { rows: { _array } }) => {
            if (_array.length == 0) {
              //initialize condition
              tx.executeSql(`insert into versions (version) values (?)`, [
                currentVersion,
              ]);
            }
            //   else if(_array[0] < 1){
            //     //version 1 updates (altering tables) go here when ready
            //     //alter table updates go here for big version changes. Example:

            //     currentVersion = 1;
            //     tx.executeSql(`update versions set version = ?`,[currentVersion],);
            //   }
          }
        );
      },
      (error) => console.log("there was an error" + error),
      () => {
        resolve("version setup complete");
      }
    );
  });
};

const insertTodo = (todoname, notificationid, reminderdate) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `
          insert into todos (todoname, notificationid, reminderdate)
          values (?, ?, ?)
        `,
          [todoname, notificationid, reminderdate]
        );
      },
      null,
      () => {
        resolve("item successfully added!");
      }
    );
  });
};

const insertEntry = (title, content) => {
  const created_on = new Date().toDateString();
  console.log(created_on);
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `
          insert into entries (title, content, created_on)
          values (?, ?, ?)
        `,
          [title, content, created_on]
        );
      },
      null,
      () => {
        resolve("item successfully added!");
      }
    );
  });
};

const updateEntry = (title, content, id) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `
          update entries set title = ?, content = ? where id = ?;`,
          [title, content, id]
        );
      },
      null,
      () => {
        resolve("item successfully added!");
      }
    );
  });
};

const getReminders = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "select * from todos where notificationid is not null",
          [], //just pass empty arguments since no variables used
          (_, { rows: { _array } }) => {
            resolve(_array);
          }
        );
      },
      null,
      () => {}
    );
  });
};

const getEntries = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "select * from entries",
          [], //just pass empty arguments since no variables used
          (_, { rows: { _array } }) => {
            resolve(_array);
          }
        );
      },
      null,
      () => {}
    );
  });
};

const getTodos = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "select * from todos where notificationid is null",
          [], //just pass empty arguments since no variables used
          (_, { rows: { _array } }) => {
            resolve(_array);
          }
        );
      },
      null,
      () => {}
    );
  });
};

const getSearchResults = async (keyString) => {
  console.log('search query function using ' + keyString);
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `select * from entries where content like ? or title like ?`,
          ['%'+keyString+'%', '%'+keyString+'%'], //just pass empty arguments since no variables used
          (_, { rows: { _array } }) => {
            resolve(_array);
          }
        );
      },
      null,
      () => {}
    );
  });
};

const removeItem = async (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql("delete from todos where id = ?;", [id]);
      },
      null,
      () => {
        resolve("item removed!");
      }
    );
  });
};

const removeEntry = async (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql("delete from entries where id = ?;", [id]);
      },
      null,
      () => {
        resolve("entry removed!");
      }
    );
  });
};

export const database = {
  insertTodo,
  getReminders,
  getTodos,
  getSearchResults,
  removeItem,
  setupTables,
  setupVersions,
  dropTables,
  getEntries,
  insertEntry,
  updateEntry,
  removeEntry,
};
