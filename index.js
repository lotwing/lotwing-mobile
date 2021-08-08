import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import '@babel/polyfill';

LogBox.ignoreAllLogs();

AppRegistry.registerComponent('com.lotwing', () => App);
