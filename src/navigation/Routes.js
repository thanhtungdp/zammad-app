import React, {useContext, useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AuthStack from './AuthStack';
import AppMain from './AppMain';
import {AuthContext} from './AuthProvider';

export default function Routes() {
  const {user, setUser} = useContext(AuthContext);

  return (
    <NavigationContainer>
      {user ? <AppMain /> : <AuthStack />}
    </NavigationContainer>
  );
}
