import React, {createContext, useContext, useState, useEffect} from 'react';
import {Linking} from 'react-native';
import {Portal, Dialog, Button, Paragraph, Text} from 'react-native-paper';
import {AuthContext, Auth} from '../navigation/AuthProvider';
import * as url from 'url';
import ZammadColors from '../components/ZammadColors';
import ExalicenseClient from 'exalicense-client';
import AsyncStorage from '@react-native-community/async-storage';
import Snackbar from 'react-native-snackbar';
import config from '../config';
import {getUniqueId} from 'react-native-device-info';
import {useInterval} from '../util/useInterval';

/**
 * The license key used is the hostname of the zammad instance
 * the user connects to, without protocol part, without leading slash
 * e.g. "developmentserver.zammad.example.com/zammadinstance1"
 * @param {String} host Zammad hostname to connect to
 */
const determineLicensekeyFromHost = host => {
  host = url.parse(host);
  return `${host.hostname}${host.pathname}`.replace(/\/$/, '');
};

function LoginConsentDialog({
  visible = false,
  onConsent = () => {},
  onDoLicenseCheck = () => {},
  ...rest
}) {
  return (
    <Portal>
      <Dialog visible={visible} dismissable={false}>
        <Dialog.Title>Licensing</Dialog.Title>
        <Dialog.Content>
          <Paragraph>
            Zammad Mobile by Exanion may{' '}
            <Text style={{fontWeight: 'bold'}}>only</Text> be used if you agree
            to the following conditions:
          </Paragraph>
          <Paragraph>
            - You may use this app in a non-commercial environment
          </Paragraph>
          <Paragraph>
            - You may use this app in a commercial non-production environment
            with a limit of two users per company
          </Paragraph>
          <Paragraph>
            - For commercial usage, please obtain a license by contacting us:{' '}
            <Text
              style={{color: 'blue'}}
              onPress={() =>
                Linking.openURL('https://zammad.exanion.de/licensing')
              }>
              https://zammad.exanion.de/licensing
            </Text>
          </Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDoLicenseCheck}>I've got a license</Button>
          <Button
            mode="contained"
            color={ZammadColors.ButtonBlue}
            onPress={onConsent}>
            Agree
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

function LicensingFailureDialog({
  visible = false,
  onConfirm = () => {},
  failureReason = '',
  ...rest
}) {
  failureReason = String(failureReason)
    .replace('KEY_EXPIRED', 'Your license has expired')
    .replace(
      'LEASE_LIMIT_REACHED',
      'More users than allowed for your license are using the app simultaneously',
    )
    .replace(
      'KEY_INVALID',
      "The licensing server can't find a licensing matching your Zammad Host",
    );
  return (
    <Portal>
      <Dialog visible={visible} dismissable={false}>
        <Dialog.Title>Licensing Error</Dialog.Title>
        <Dialog.Content>
          <Paragraph>
            The license check failed for the following reason: {failureReason}
          </Paragraph>
          <Paragraph>
            <Text style={{fontWeight: 'bold'}}>
              You mustn't use this app comercially if you don't have a valid
              license.
            </Text>
          </Paragraph>
          <Paragraph>
            For commercial usage, please obtain a license by contacting us:{' '}
            <Text
              style={{color: 'blue'}}
              onPress={() =>
                Linking.openURL('https://zammad.exanion.de/licensing')
              }>
              https://zammad.exanion.de/licensing
            </Text>
          </Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button
            mode="contained"
            color={ZammadColors.ButtonBlue}
            onPress={onConfirm}>
            Confirm & Logout
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

/**
 * Provide licensing meta to the whole app
 */
export const LicensingContext = createContext({});

export const LicensingProvider = ({children}) => {
  const [license, setLicense] = useState(
    new ExalicenseClient(config.LICENSING_ENDPOINT, {
      signingKey: config.LICENSING_SIGNINGKEY,
      clientId: getUniqueId(),
    }),
  );
  const [licenseKeyToUse, setLicenseKeyToUse] = useState();
  const [licensingFailureCode, setLicensingFailureCode] = useState();
  const [showLoginConsentDialog, setShowLoginConsentDialog] = useState(false);
  const [licenseCheckTimer, setLicenseCheckTimer] = useState();

  const {user, logout: doLogout} = useContext(AuthContext);

  useEffect(() => {
    return Auth.onAuthStateChanged(user => {
      if (user) doLicenseCheck(true, user); //login
      if (!user) {
        //logout
        if (licenseCheckTimer) clearInterval(licenseCheckTimer);
        license
          .releaseLease()
          .then(r => console.log('Licensing - Releasing lease', r)); //logout
      }
    });

    //todo notify to app sleep state changes
  }, []);

  const doLicenseCheck = async (doingLogin = false, _user) => {
    //run a license check
    //the "doingLogin" flag determines whether "pre-flight" licensing informaiton shall be shown to the user
    const licenseKey = determineLicensekeyFromHost((_user || user).api.host);
    setLicenseKeyToUse(licenseKey);

    //check if a license key for this server is supposed to be available
    //@todo is this prone to injection attacks?
    const hasStored = await AsyncStorage.getItem(
      `@LicenseData:hasLicFor-${licenseKey}`,
    );

    //show login consent dialog if the key is not stored and user is currently logging in
    if (!hasStored) {
      if (doingLogin) {
        setShowLoginConsentDialog(true);
      }
      return;
    }

    license.setLicenseKey(licenseKey);
    //console.log('Using license key ', licenseKey);

    let checkResult;
    try {
      checkResult = await license.check();
    } catch (err) {
      Snackbar.show({
        text: "Couldn't connect to licensing server: " + String(err),
      });
      return;
    }

    if (!checkResult.success) {
      console.log('License check failed.', checkResult.errorCode);
      setLicensingFailureCode(checkResult.errorCode || 'Unknown');
    }
  };

  useInterval(() => {
    if(user){
      //check if currently logged in - user object is stored
      doLicenseCheck();
    }
  }, config.LICENSING_CHECK_INTERVAL * 1000);

  return (
    <LicensingContext.Provider
      value={{
        dummyStub: () => console.log('dummy'),
        licenseCheck: doLicenseCheck,
      }}>
      <LoginConsentDialog
        visible={showLoginConsentDialog}
        onConsent={() => setShowLoginConsentDialog(false)}
        onDoLicenseCheck={async () => {
          await AsyncStorage.setItem(
            `@LicenseData:hasLicFor-${licenseKeyToUse}`,
            'yep',
          );
          doLicenseCheck();
          setShowLoginConsentDialog(false);
        }}
      />
      <LicensingFailureDialog
        visible={licensingFailureCode ? true : false}
        failureReason={licensingFailureCode}
        onConfirm={async () => {
          await AsyncStorage.removeItem(
            `@LicenseData:hasLicFor-${licenseKeyToUse}`,
          );
          await doLogout();
          setLicensingFailureCode(null);
        }}
      />
      {children}
    </LicensingContext.Provider>
  );
};
