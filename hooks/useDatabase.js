import React, { useEffect } from "react";

import { database } from "../components/Database";

//simple startup hook that has a boolean flag for when database is ready
export default function useDatabase() {
  const [isDbLoadingComplete, setDbLoadingComplete] = React.useState(false);

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
