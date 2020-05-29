import React, {useState, useContext, useEffect} from 'react';
import {View, StyleSheet, Text, Linking} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {Title} from 'react-native-paper';
import Snackbar from 'react-native-snackbar';
import {
  LoginFormButton,
  LoginFormInput,
  LoginFormCheckbox,
} from '../components/Login';
import {AuthContext, Auth} from '../navigation/AuthProvider';
import Loading from '../components/Loading';
import ZammadColors from '../components/ZammadColors';

const storeLoginData = async (host, email, password, savePassword) => {
  try {
    await AsyncStorage.multiSet([
      ['@AuthData:host', host],
      ['@AuthData:email', email],
      ['@AuthData:password', savePassword ? password : ''],
      ['@AuthData:savePassword', savePassword ? 'true' : ''],
    ]);
  } catch (err) {
    Snackbar.show({
      text: "Couldn't save credentials: " + String(err[0].message),
      duration: Snackbar.LENGTH_SHORT,
    });
  }
};

export default function LoginScreen({navigation}) {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [host, setHost] = useState();
  const [savePassword, setSavePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {user, setUser, login} = useContext(AuthContext);

  // Handle user state changes
  function onAuthStateChanged() {
    setLoading(false);
  }

  useEffect(() => {
    return Auth.onAuthStateChanged(onAuthStateChanged);
  }, []);

  useEffect(() => {
    let isActive = true;
    AsyncStorage.getItem('@AuthData:host', (error, result) => {
      if (result && !error && isActive) {
        setHost(result);
      }
    });
    AsyncStorage.getItem('@AuthData:email', (error, result) => {
      if (result && !error && isActive) {
        setEmail(result);
      }
    });
    AsyncStorage.getItem('@AuthData:savePassword', (error, result) => {
      if (result && !error && isActive) {
        setSavePassword(result ? true : false);
      }
    });
    AsyncStorage.getItem('@AuthData:password', (error, result) => {
      if (result && !error && isActive) {
        setPassword(result);
      }
    });
    return () => {
      isActive = false;
    };
  }, []);

  if (loading) return <Loading />;

  return (
    <>
      <View style={styles.container}>
        <Title style={{fontSize: 24, marginBottom: 5}}>Zammad Mobile</Title>
        <Title style={{fontSize: 16, marginBottom: 30}}>
          Powered by Exanion
        </Title>
        <LoginFormInput
          label="Zammad Host"
          value={host}
          autoCapitalize="none"
          onChangeText={userHost => setHost(userHost)}
        />
        <LoginFormInput
          label="Email/ Username"
          value={email}
          autoCapitalize="none"
          onChangeText={userEmail => setEmail(userEmail)}
        />
        <LoginFormInput
          label="Password"
          value={password}
          secureTextEntry={true}
          autoCapitalize="none"
          onChangeText={userPassword => setPassword(userPassword)}
        />
        <LoginFormCheckbox
          label="Save password (INSECURE!)"
          checked={savePassword}
          onPress={() => {
            setSavePassword(!savePassword);
          }}
        />
        <LoginFormButton
          title="Login"
          mode="contained"
          labelStyle={styles.loginButtonLabel}
          onPress={() => {
            setLoading(true);
            storeLoginData(host, email, password, savePassword);
            login(host, email, password).catch(err => {
              setLoading(false);
              Snackbar.show({
                text: "Couldn't log in: " + String(err),
                duration: Snackbar.LENGTH_LONG,
              });
            });
          }}
        />
      </View>
      <View
        style={{
          backgroundColor: ZammadColors.ChatBackground,
          alignItems: 'center',
          width: '100%',
        }}>
        <Text>
          More information? Visit{' '}
          <Text
            style={{color: 'blue'}}
            onPress={() => Linking.openURL('https://zammad.exanion.de')}>
            https://zammad.exanion.de
          </Text>
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: ZammadColors.ChatBackground,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 24,
    marginBottom: 10,
  },
  loginButtonLabel: {
    fontSize: 22,
  },
  navButtonText: {
    fontSize: 16,
  },
});
