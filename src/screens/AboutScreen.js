import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {Linking, Text, View, ScrollView} from 'react-native';
import {Title, Paragraph, Button} from 'react-native-paper';
import {headerDefault} from '../components/Header';
import ZammadColors from '../components/ZammadColors';
import licenses from '../meta/licenses';
import version from '../meta/version.json';

const Stack = createStackNavigator();

const About = ({navigation}) => {
  navigation.setOptions({title: 'About Zammad Mobile'});
  return (
    <>
      <View
        style={{
          backgroundColor: ZammadColors.ChatBackground,
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Title style={{fontSize: 24, marginBottom: 5}}>Zammad Mobile</Title>
        <Title style={{fontSize: 16, marginBottom: 30}}>
          Powered by Exanion
        </Title>
        <Paragraph>
          <Text style={{fontWeight: 'bold'}}>Version: </Text>
          {version.version || 'UNKNOWN'}
        </Paragraph>
        <Paragraph>
          <Text style={{fontWeight: 'bold'}}>Build: </Text>
          {version.build || 'UNKNOWN'}
        </Paragraph>
        <Paragraph>
          <Text style={{fontWeight: 'bold'}}>Git: </Text>
          <Text style={{fontSize: 8}}>{version.git || 'UNKNOWN'}</Text>
        </Paragraph>
      </View>
      <View
        style={{
          backgroundColor: ZammadColors.ChatBackground,
          alignItems: 'center',
          width: '100%',
        }}>
        <Button
          icon="information"
          mode="outlined"
          color={ZammadColors.ButtonBlue}
          style={{marginBottom: 12}}
          onPress={() => navigation.navigate('licenses')}>
          Open Source Licenses
        </Button>
        <Paragraph>
          More information? Visit{' '}
          <Text
            style={{color: 'blue'}}
            onPress={() => Linking.openURL('https://zammad.exanion.de')}>
            https://zammad.exanion.de
          </Text>
        </Paragraph>
        <Paragraph>© 2020 Exanion UG (haftungsbeschränkt)</Paragraph>
      </View>
    </>
  );
};

const Licenses = ({navigation}) => {
  navigation.setOptions({title: 'Open Source Licences'});

  const licStrings = [];
  for (const k in licenses) {
    licStrings.push(`-----------------------------
The following software may be included in this product: ${
      licenses[k].name
    }. The software contains the following license and notice below:
${licenses[k].copyright}
${licenses[k].licenseText}
`);
  }

  return (
    <ScrollView>
      <Paragraph key="0000_index">
        The following sets forth attribution notices for third party software
        that may be contained in portions of the Zammad Mobile App by Exanion.
      </Paragraph>
      <Paragraph>{licStrings}</Paragraph>
    </ScrollView>
  );
};

export default function AboutScreen({navigation}) {
  return (
    <Stack.Navigator
      headerMode="screen"
      screenOptions={{
        header: headerDefault,
      }}
      initialRouteName="about">
      <Stack.Screen name="about" component={About} />
      <Stack.Screen name="licenses" component={Licenses} />
    </Stack.Navigator>
  );
}
