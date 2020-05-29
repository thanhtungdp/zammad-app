import React from 'react';
import {View, StyleSheet, Dimensions, Text} from 'react-native';
import {Button, TextInput, Checkbox} from 'react-native-paper';
import ZammadColors from '../components/ZammadColors';

const {width, height} = Dimensions.get('screen');

const LoginFormInput = ({label, ...rest}) => {
  return (
    <TextInput label={label} style={styles.input} numberOfLines={1} {...rest} />
  );
};

const LoginFormButton = ({title, ...rest}) => {
  return (
    <Button
      {...rest}
      style={styles.button}
      contentStyle={styles.buttonContainer}>
      {title}
    </Button>
  );
};

const LoginFormCheckbox = ({label, checked, ...rest}) => {
  return (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <Text>{label}</Text>
      <Checkbox {...rest} status={checked ? 'checked' : 'unchecked'} />
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 10,
  },
  buttonContainer: {
    width: width / 1.5,
    height: height / 15,
    backgroundColor: ZammadColors.ButtonBlue,
  },
  input: {
    marginTop: 10,
    marginBottom: 10,
    width: width / 1.2,
    height: height / 15,
  },
});

export {LoginFormInput, LoginFormButton, LoginFormCheckbox};
