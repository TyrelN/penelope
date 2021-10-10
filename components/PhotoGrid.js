import React from 'react'
import { TouchableOpacity, Dimensions, FlatList, Image} from 'react-native'


import { formatPhotoUri } from './Picsum'
//navigation parameter imported so that a selected image can route to a new page with parameters
export default function PhotoGrid({ photos, numColumns, onEndReached, navigation}) {
  const { width } = Dimensions.get('window')
 
  const size = width / numColumns 
  //The component that renders the flatlist 
  return (
    <FlatList
      data={photos}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      onEndReached={onEndReached}
      renderItem={({ item }) => (
       <TouchableOpacity
       onPress={()=>{
        const itemId = item.id;
        //send the image id to a dedicated screen
        navigation.navigate('PhotoDetail', {photo: item.id})
       }}
       >
        <Image
          source={{
            width: size,
            height: size,
            uri: formatPhotoUri(item.id, width, width),
          }}
        />
       </TouchableOpacity>
      )}
    />
  )
}

