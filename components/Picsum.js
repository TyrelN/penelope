const BASE_URL = `https://picsum.photos/v2`

//returns the api query for a list of photos using a page number parameter
export async function getList(page = 1) {
  const response = await fetch(`${BASE_URL}/list?page=${page}`)
  const photos = await response.json()
  return photos
}


//returns the picsum api query with picture id, width and height parameters
export function formatPhotoUri(id, width, height) {
  return `https://picsum.photos/id/${id}/${Math.floor(width)}/${Math.floor(
    height
  )}`
}
