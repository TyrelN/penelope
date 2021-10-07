//reference: https://www.jsparling.com/using-hooks-and-context-with-sqlite-for-expo-in-react-native/
import React, {useEffect} from 'react';

import { database } from '../components/Database';

//simple startup hook that has a boolean flag for when database is ready
export default function useDatabase(){
    const [isDbLoadingComplete, setDbLoadingComplete] = React.useState(false);

    useEffect(()=>{
            try{
                database.setupTables().then((success)=> 
                {setDbLoadingComplete(true);
                    console.log(success);
                });
                
        }catch(e){
            console.warn(e);
        }
    
    }, []);

   return isDbLoadingComplete;
}