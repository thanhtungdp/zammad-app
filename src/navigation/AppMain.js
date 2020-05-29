import {createDrawerNavigator} from '@react-navigation/drawer';
import React, {useContext} from 'react';
import {Loading} from 'react-native';
import {AuthContext} from '../navigation/AuthProvider';
import AboutScreen from '../screens/AboutScreen';
import TicketsOverviewScreen from '../screens/TicketsOverviewScreen';

const Drawer = createDrawerNavigator();

const Logout = ({navigation}) => {
  const {logout} = useContext(AuthContext);
  navigation.jumpTo("Tickets");
  logout();
  return (null);
};

export default function AppMain() {
  return (
    <Drawer.Navigator initialRouteName="Tickets">
      <Drawer.Screen name="Tickets" component={TicketsOverviewScreen} />
      <Drawer.Screen name="About" component={AboutScreen} />
      <Drawer.Screen name="Logout" component={Logout} />
    </Drawer.Navigator>
  );
}
