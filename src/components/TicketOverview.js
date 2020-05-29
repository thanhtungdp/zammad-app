import React, {useState, useEffect, useContext} from 'react';
import {View, FlatList} from 'react-native';
import {
  Card,
  Surface,
  ActivityIndicator,
  Colors,
  Avatar,
  TouchableRipple,
} from 'react-native-paper';
import Loading from './Loading';
import {AuthContext} from '../navigation/AuthProvider';

const TicketCard = ({ticket, onPress, filters = []}) => {
  const {user} = useContext(AuthContext);
  const [tstate, setTsate] = useState(null);

  //apply filters
  let visible = true;
  filters.forEach(f => {
    visible &= f.filterFunc({ticket, user: user.user});
  });

  useEffect(() => {
    let didCancel = false;

    ticket.state(user.api).then(state => {
      if (!didCancel) {
        ticket.stateName = state.name;
        setTsate(state);
      }
    });

    return () => {
      didCancel = true;
    };
  }, []);

  if(!visible) return null;

  let statusIndicator = <View />;
  if (tstate) {
    let color;
    if (
      tstate.name == 'new' ||
      tstate.name == 'open' ||
      tstate.name == 'pending reminder'
    ) {
      color = Colors.orange400;
    } else {
      color = Colors.green600;
    }
    statusIndicator = rest => (
      <Avatar.Text text="" style={{backgroundColor: color}} {...rest} />
    );
  } else {
    statusIndicator = rest => <ActivityIndicator animating={true} {...rest} />;
  }

  return (
    <Surface
      style={{elevation: 2, marginLeft: 20, marginRight: 20, marginTop: 10}}>
      <TouchableRipple onPress={onPress} borderless={true}>
        <Card>
          <Card.Title
            title={ticket.title}
            subtitle={`#${ticket.number} | Created at ${ticket.createdAt}`}
            left={statusIndicator}
          />
        </Card>
      </TouchableRipple>
    </Surface>
  );
};

const TicketOverviewView = ({tickets, onTicketPress, filters = []}) => {
  if (!tickets) {
    return <Loading />;
  }

  return (
    <FlatList
      data={tickets}
      renderItem={({item}) => (
        <TicketCard
          ticket={item}
          onPress={() => onTicketPress(item)}
          filters={filters}
        />
      )}
      keyExtractor={ticket => ticket.id.toString()}
      contentContainerStyle={{paddingBottom: 10}}
    />
  );
};

export {TicketOverviewView, TicketCard};
