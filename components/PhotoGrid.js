import React from 'react'
import { TouchableOpacity, Dimensions, FlatList, Image, PixelRatio, Alert, Pressable, Touchable} from 'react-native'


import { formatPhotoUri } from './Picsum'

export default function PhotoGrid({ photos, numColumns, onEndReached, navigation}) {
  const { width } = Dimensions.get('window')
 
  const size = width / numColumns
//TODO: use PixelRatio to fetch appropriately sized images per screen
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

