import React, {useContext, useState, useEffect} from 'react';
import {View} from 'react-native';
import {
  Portal,
  Dialog,
  Button,
  Menu,
  Paragraph,
  Text,
  TextInput,
  Divider,
  Provider,
  Caption,
} from 'react-native-paper';
import Loading from '../components/Loading';
import {AuthContext} from '../navigation/AuthProvider';
import Snackbar from 'react-native-snackbar';
import {Picker} from '@react-native-community/picker';
import {TicketState, TicketPriority} from 'zammad-js-api';

export default function TicketSettings({ticket, visible, onDone = () => {}}) {
  const {user} = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [currentOwner, setCurrentOwner] = useState({});
  const [currentPriority, setCurrentPriority] = useState({});
  const [currentState, setCurrentState] = useState({});
  const [allPriorities, setAllPriorities] = useState([]);
  const [allStates, setAllStates] = useState([]);
  const [newOwner, setNewOwner] = useState(null);
  const [newPriority, setNewPriority] = useState(null);
  const [newState, setNewState] = useState(null);

  useEffect(() => {
    let isActive = true;

    //fetch all of data
    Promise.all([
      ticket.owner(user.api).then(res => {
        if (isActive) setCurrentOwner(res);
      }),
      ticket.priority(user.api).then(res => {
        if (isActive) setCurrentPriority(res);
      }),
      ticket.state(user.api).then(res => {
        if (isActive) setCurrentState(res);
      }),
      TicketState.getAll(user.api).then(res => {
        if (isActive) setAllStates(res);
      }),
      TicketPriority.getAll(user.api).then(res => {
        if (isActive) setAllPriorities(res);
      }),
    ])
      .then(res => {
        if (isActive) setLoading(false);
      })
      .catch(err => {
        Snackbar.show({
          text: "Couldn't load: " + String(err),
          duration: Snackbar.LENGTH_SHORT,
        });
      });

    return () => {
      isActive = false;
    };
  }, []);

  const saveChanges = () => {
    if (newOwner || newState || newPriority) {
      //at least one setting was changed
      if(newOwner) ticket.ownerId = newOwner;
      if(newState) ticket.stateId = newState;
      if(newPriority) ticket.priorityId = newPriority;
      ticket
        .update(user.api)
        .then(res =>
          Snackbar.show({
            text: 'Changes saved successfully!',
            duration: Snackbar.LENGTH_SHORT,
          }),
        )
        .catch(err => {
          console.log("Error in TicketSettings.ticket.update", err);
          Snackbar.show({
            text: "Couldn't save changes: " + String(err),
            duration: Snackbar.LENGTH_SHORT,
          });
        }
        );
    }
    onDone();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDone} dismissable={true}>
        <Dialog.Title>Ticket Settings</Dialog.Title>
        {loading ? (
          <>
            <Dialog.Content>
              <Loading />
            </Dialog.Content>
            <Dialog.Actions>
              <Button icon="cancel" onPress={onDone}>
                Close
              </Button>
            </Dialog.Actions>
          </>
        ) : (
          <>
            <Dialog.Content>
              <View>
                <Caption>Owner</Caption>
                <Picker
                  selectedValue={newOwner || currentOwner.id}
                  onValueChange={v => setNewOwner(v)}>
                  <Picker.Item label="- (Unassigned)" value={1} />
                  <Picker.Item
                    label={`${user.user.firstname} ${user.user.lastname} (You)`}
                    value={user.user.id}
                  />
                  <Picker.Item
                    label={`${currentOwner.firstname} ${currentOwner.lastname}`}
                    value={currentOwner.id}
                  />
                </Picker>
                <View />
              </View>
              <View style={{}}>
                <Caption>Priority</Caption>
                <Picker
                  selectedValue={newPriority || currentPriority.id}
                  onValueChange={v => setNewPriority(v)}>
                  {allPriorities.map(p => (
                    <Picker.Item key={p.id} label={p.name} value={p.id} />
                  ))}
                </Picker>
              </View>
              <View style={{}}>
                <Caption>State</Caption>
                <Picker
                  selectedValue={newState || currentState.id}
                  onValueChange={v => setNewState(v)}>
                  {allStates.map(p => (
                    <Picker.Item key={p.id} label={p.name} value={p.id} />
                  ))}
                </Picker>
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <Button icon="cancel" onPress={onDone}>
                Close
              </Button>
              <Button icon="content-save" onPress={() => saveChanges()}>
                Save
              </Button>
            </Dialog.Actions>
          </>
        )}
      </Dialog>
    </Portal>
  );
}
