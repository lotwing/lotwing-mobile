# lotwing-mobile

<i>The React Native Sales Clerk Inventory Management App</i>

<h2>Background</h2>
There are three core branches in this project:
<ul>
  <li> master </li>
  <li> develop </li>
  <li> develop-native </li>
  + <li> develop-ejected </li>
</ul>

<h2>To Add: Additional Screens and Functionality</h2>
Add code to the <i>/components</i> folder.

<h2>To run the App</h2> 
Execute the following command from within the <i>/lotwing-mobile</i> folder:

<h3>On iOS</h3> 
<h4>Simulator</h4>
<code>>> npm run ios</code>
<h4>iOS Physical Device</h4>
<code>>> npx react-native run-ios --device "My iPhone Name"</code>

<h3>On Android</h3> 
<h4>Simulator / Android Physical Device</h4>
<code>>> npm run android</code>

<h2>Building iOS</h2>

1. Make sure your scheme has the correct settings for Release target (Lotwing)
2. In XCODE, navigate to `Project > Archive`
3. Say yes to every prompt, the default selection is correct.
4. Once it has finished building, upload it. Again say yes / continue on every step.
5. When it finishes uploading, it will run in the app store build process, after which a new TestFlight build will become available
6. To publish a public release, proceed in the appstoreconnect > App Store > + Version or Platform workflow

<h2> Building Android </h2>

- (ONLY ONCE) Set up keychain access key for the keystore [guide](https://medium.com/@hasangi/making-a-signed-apk-for-your-react-native-application-98e8529678db):

1. (MAC) Open Keychain Access
2. Add a new password by pressing the plus sign
3. As name, put 'lotwing_mobile_keystore'. Fill in the account name as 'lotwing'. The password is a secret and you can get it from product owners (it should be kept in a safe place and not transmitted unencrypted)
4. Using the [generated](https://medium.com/@hasangi/making-a-signed-apk-for-your-react-native-application-98e8529678db) signing file, put it into the `android/app` folder. Don't commit the file

- Build apk

1. MAKE SURE THE .env is correct depending on your build scope
2. In `android` run `./gradlew assembleRelease`
3. When it finishes, the .apk is available in `android/app/build/outputs/apk/release/app-release.apk`
4. Upload it to the google play console
5. To publish a public release, proceed in the google play store (beta release -> promote to public)
