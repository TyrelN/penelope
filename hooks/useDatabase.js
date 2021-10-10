import React, { useEffect } from "react";

import { database } from "../components/Database";

//simple startup hook that has returns a boolean flag when the tables have been setup
export default function useDatabase() {
  const [isDbLoadingComplete, setDbLoadingComplete] = React.useState(false);
  //effect starts when the hook is called in App.tsx
  useEffect(() => {
    try {
      database.setupTables().then((success) => {
        console.log(success);
        database.setupVersions().then((success) => {
          console.log(success);
          setDbLoadingComplete(true);
        });
      });
    } catch (e) {
      console.warn(e);
    }
  }, []);

  return isDbLoadingComplete;
}
