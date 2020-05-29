import React, {useContext, useState, useEffect} from 'react';
import {TicketOverviewView} from '../components/TicketOverview';
import {
  Appbar,
  Portal,
  Button,
  Dialog,
  Paragraph,
  Checkbox,
} from 'react-native-paper';
import {createStackNavigator} from '@react-navigation/stack';
import {AuthContext} from '../navigation/AuthProvider';
import {Ticket} from 'zammad-js-api';
import ZammadColors from '../components/ZammadColors';
import Header, {headerDefault} from '../components/Header';
import TicketDetailScreen from './TicketDetailScreen';

const Stack = createStackNavigator();

const TicketFilterModal = ({
  visible = false,
  onDismiss = () => {},
  filters = {},
  onFiltersChanged = () => {},
}) => {
  const AvailableFilters = {
    ASSIGNED_TO_ME: {
      description: 'Only tickets assigned to me',
      filterFunc: ({ticket, user}) => ticket.ownerId === user.id,
    },
    OPEN: {
      description: 'Ticket is open/ new',
      filterFunc: ({ticket}) => {
        console.log(ticket.stateName);
        return (
          ticket.stateName === 'new' ||
          ticket.stateName === 'open' ||
          ticket.stateName === 'pending reminder' ||
          !ticket.stateName
        );
      },
    },
    CLOSED: {
      description: 'Ticket is closed',
      filterFunc: ({ticket}) =>
        ticket.stateName === 'closed' ||
        ticket.stateName === 'removed' ||
        !ticket.stateName,
    },
  };

  for (const f in AvailableFilters) {
    [AvailableFilters[f].checked, AvailableFilters[f].setChecked] = useState(
      (filters || {}).f ? true : false,
    );
  }

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Filters</Dialog.Title>
        <Dialog.Content>
          {Object.keys(AvailableFilters).map(k => {
            const filter = AvailableFilters[k];
            return (
              <Checkbox.Item
                key={k}
                label={filter.description}
                status={filter.checked ? 'checked' : 'unchecked'}
                onPress={() => filter.setChecked(!filter.checked)}
              />
            );
          })}
        </Dialog.Content>
        <Dialog.Actions>
          <Button icon="cancel" onPress={onDismiss}>
            Cancel
          </Button>
          <Button
            icon="filter"
            onPress={() => {
              onFiltersChanged(
                Object.keys(AvailableFilters)
                  .map(f => ({
                    name: f,
                    ...AvailableFilters[f],
                  }))
                  .filter(f => f.checked),
              );
              onDismiss();
            }}>
            Apply
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const TicketsOverview = ({navigation}) => {
  const [tickets, setTickets] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState([]);
  const {user} = useContext(AuthContext);

  navigation.setOptions({
    title: 'Ticket Overview',
    header: props => (
      <Header {...props}>
        <Appbar.Action
          icon="reload"
          color={ZammadColors.MenuTextReadable}
          onPress={() => {
            setTickets(null);
            Ticket.getAll(user.api).then(tickets => {
              setTickets(tickets);
            });
          }}
        />
        <Appbar.Action
          icon="filter"
          color={ZammadColors.MenuTextReadable}
          onPress={() => setFilterVisible(true)}
        />
      </Header>
    ),
  });

  useEffect(() => {
    let didCancel = false;
    Ticket.getAll(user.api).then(tickets => {
      if (!didCancel) setTickets(tickets);
    });

    return () => {
      didCancel = true;
    };
  }, []);

  return (
    <>
      <TicketOverviewView
        tickets={tickets}
        onTicketPress={ticket => navigation.navigate('detail', {ticket})}
        filters={filters}
      />
      <TicketFilterModal
        visible={filterVisible}
        onDismiss={() => setFilterVisible(false)}
        onFiltersChanged={filters => setFilters(filters)}
        filters={filters}
      />
    </>
  );
};

const TicketsOverviewScreen = ({navigation}) => {
  return (
    <Stack.Navigator
      headerMode="screen"
      screenOptions={{
        header: headerDefault,
      }}
      initialRouteName="overview">
      <Stack.Screen name="overview" component={TicketsOverview} />
      <Stack.Screen name="detail" component={TicketDetailScreen} />
    </Stack.Navigator>
  );
};

export default TicketsOverviewScreen;
