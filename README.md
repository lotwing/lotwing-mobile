# lotwing-mobile
<i>The React Native Sales Clerk Inventory Management App</i>

<h2>Background</h2>
There are three core branches in this project:
<ul>
  <li> master </li>
  <li> develop </li>
  <li> develop-native </li>
</ul>

Because the Lotwing App uses Mapbox, a non-expo library, to render lot views we have to develop a mixed Expo and expo-ejected React Native app following the development workflow described in Codeburst's <a href="https://codeburst.io/building-react-native-projects-with-native-code-part-1-311a094bdb94">How to work with ejected app</a>.

To get access to the ejected app which includes the Mapbox functions pull the develop-native branch. 

In basic Expo-based React Native Apps the majority of an app's functionality is built in the <i>/components</i> folder. In an expo-ejected app ios and android have their own folders, <i>/ios</i> and <i>/android</i> respectively, where the native code and settings exist. 

<h2>To Add: Additional Screens and Functionality</h2>
Add code to the <i>/components</i> folder.

<h2>To Add: Mapbox Related Functionality</h2>
You also add code to the <i>/components</i> folder. However, to view your changes you must be on the develop-native branch, running Mac 10.13 or above. This branch has the required <a href="https://github.com/mapbox/react-native-mapbox-gl">iOS and Android Mapbox Integrations</a>.
