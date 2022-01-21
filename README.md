# Penelope
<div align="center"><img src="https://github.com/TyrelN/penelope/blob/main/assets/images/penelope-logo.png" width="300"/></div><br>

## About
Penelope is an organization app built using React Native and Expo. Penelope has various features that aim to help artists keep their lives organized, their thoughts archived, and reference quickly accessible.

Try out the application [here](https://expo.dev/@tyreln/penelope-creative-assistant).
## Features

Penelope comes with three tabs each encompassing a feature:

### Reminders:
A tab for setting to-do list items and reminders. To-do list items are just that, and for more time-sensitive cases, you can set your to-do item as a reminder, which allows you to attach a date to it and schedule a notification for the date and time selected.

<p align="center">
<img src="https://user-images.githubusercontent.com/43082470/149960039-3571a5c6-e504-4a09-aaa3-99ae041d4b6d.PNG" width="300"/>
<img src="https://user-images.githubusercontent.com/43082470/149963651-7363ede6-4dde-42fe-a0c1-f0733910fa25.png" width="300"/>
</p>


### Notes
This tab is for jotting down notes and thoughts you would like to keep and be able to find later. You can filter your notes by keywords and phrases to more efficiently find them over time.

<p align="center">
<img src="https://user-images.githubusercontent.com/43082470/149960006-054a841b-be74-4d93-a12e-707b9beeadfa.PNG" width="300"/>
<img src="https://user-images.githubusercontent.com/43082470/149960022-3955c1b4-bbf4-4917-87ce-b6912cb59fcb.PNG" width="300"/>
</p>

### References
A gallery of images queried from the [picsum](https://picsum.photos/) api that can be selected to load a larger version of an image that can be scaled via two-touch pinching and one-touch panned. The current iteration is an expanded-upon version of the photo gallery exercise from [React Native Express](https://www.reactnative.express/exercises/photo_gallery).

<p align="center">
<img src="https://user-images.githubusercontent.com/43082470/149959291-63f5f132-1ebe-451b-9b55-bc68b4a66201.PNG" width="300"/>
<img src="https://user-images.githubusercontent.com/43082470/149962991-5155744e-c555-466a-866d-52eeb977461b.png" width="300"/>
</p>

## Roadmap for Version 2.0
There are some fundamental improvements planned for 2.0 of Penelope, primarily involving the Notes and References tabs:

- [ ] Revamp the references tab, utilize the [Unsplash API](https://source.unsplash.com/) for timed reference drawings and topic based image queries.
- [ ] allow notes to be filtered by date (entries before or after a date, or on a certain date)
- [ ] color-code note entries (by some quantifiable metric such as day of the month)
- [ ] allow swiping to delete items in the To-do and Notes tabs
- [ ] allow for repeated reminders on presets (weekly/monthly)


## Setup:
After downloading the repository, you can run the project using these commands:<br>
`npm install --global yarn`<br>
`yarn install`<br>
`expo start`<br>
This will activate Expo and allow you to debug the application using iOS/Android with the [Expo Go](https://expo.dev/client) app.

## Additional Notes:
* Notes and To-Do entries can be deleted by tap and holding them.
* The Penelope logo was designed by Tyrel Narciso. All rights reserved.

## References and Resources
* https://itnext.io/using-sqlite-in-expo-for-offline-react-native-apps-a408d30458c3
* https://www.youtube.com/watch?v=Xp0q8ZDOeyE
* https://www.youtube.com/watch?v=R7vyLItMQJw
* https://www.reactnative.express/exercises/photo_gallery
* http://www.embusinessproducts.com/react-native-sqlite-database-upgrade-strategy/
* https://www.naroju.com/how-to-use-react-context-to-pass-database-reference-to-child-components/
* https://www.jsparling.com/using-hooks-and-context-with-sqlite-for-expo-in-react-native/


