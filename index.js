import { AppRegistry, Platform } from 'react-native';
import App from './App';
import '@babel/polyfill';

console.disableYellowBox = true;

if (Platform.OS === 'ios') {
  global.XMLHttpRequest =
    global.originalXMLHttpRequest || global.XMLHttpRequest;
  global.FormData = global.originalFormData || global.FormData;
}

AppRegistry.registerComponent('com.lotwing', () => App);
