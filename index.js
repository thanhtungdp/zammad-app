/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

/**
 * Workaround for axios not finding btoa functions
 * @Todo Check later if has been fixed in axios or elsewhere
 */
import {decode, encode} from 'base-64'
if (!global.btoa) {
    global.btoa = encode;
}
if (!global.atob) {
    global.atob = decode;
}

AppRegistry.registerComponent(appName, () => App);