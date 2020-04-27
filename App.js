import React from 'react';
import { StyleSheet } from 'react-native';
import {Appbar} from 'react-native-paper';

class App extends React.Component {
  render() {
    return (
      <Appbar style={styles.bottom}>
        <Appbar.Action
          icon="archive"
          onPress={() => console.log('Pressed archive')}
        />
        <Appbar.Action
          icon="email"
          onPress={() => console.log('Pressed mail')}
        />
        <Appbar.Action
          icon="label"
          onPress={() => console.log('Pressed label')}
        />
        <Appbar.Action
          icon="delete"
          onPress={() => console.log('Pressed delete')}
        />
      </Appbar>
    );
  }
}

const styles = StyleSheet.create({
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
});

export default App;
