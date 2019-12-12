import { AppRegistry, Platform } from 'react-native';
import App from './App';
import '@babel/polyfill';

console.disableYellowBox = true;

AppRegistry.registerComponent('com.lotwing', () => App);
