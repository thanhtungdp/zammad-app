import React from 'react';
import {IconButton, Appbar, Colors} from 'react-native-paper';
import ZammadColors from './ZammadColors';

const Header = ({scene, previous, navigation, children}) => {
  const {options} = scene.descriptor;
  const title =
    options.headerTitle !== undefined
      ? options.headerTitle
      : options.title !== undefined
      ? options.title
      : scene.route.name;

  const subtitle = options.subtitle;

  return (
    <Appbar.Header style={{backgroundColor: ZammadColors.MenuBackground}}>
      {previous ? (
        <IconButton
          icon="arrow-left"
          onPress={navigation.goBack}
          color={ZammadColors.MenuText}
        />
      ) : (
        <IconButton
          icon="menu"
          onPress={navigation.openDrawer}
          color={ZammadColors.MenuText}
        />
      )}
      <Appbar.Content
        title={title}
        subtitle={subtitle}
        titleStyle={{color: ZammadColors.MenuTextReadable}}
      />
      {children}
    </Appbar.Header>
  );
};

const headerDefault = ({scene, previous, navigation, children}) => (
  <Header scene={scene} previous={previous} navigation={navigation}>
    {children}
  </Header>
);

export default Header;
export {headerDefault};
