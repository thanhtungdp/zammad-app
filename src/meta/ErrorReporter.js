import React, {useState} from 'react';
import {View, Dimensions} from 'react-native';
import {
  Portal,
  Modal,
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import config from '../config';
import axios from 'axios';
import {getDeviceId, getUniqueId} from "react-native-device-info";

const {width} = Dimensions.get('screen');

class ErrorReporter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  _hideModal() {
    this.setState({error: null});
  }

  _sendReport() {
    console.log('Sending crash report...');
    this.setState({sendLoading: true});
    axios
      .post(
        `${config.CRASHREPORTER_ENDPONT}/report`,
        {
          date: new Date(),
          fingerprint: getUniqueId(),
          deviceinfo: getDeviceId(),
          version: null,
          build: null,
          license: null,
          errorMsg: this.state.error.message,
          errorFile: this.state.error.fileName,
          errorLine: this.state.error.lineNumber,
          stacktrace: this.state.error.componentStack,
        },
        {headers: {Authorization: `Bearer ${config.CRASHREPORTER_TOKEN}`}},
      )
      .then(res => {
        console.log('Successfully sent crash report');
        if (this._isMounted) {
          this.setState({
            error: null,
            sendLoading: false,
          });
        }
      })
      .catch(err => {
        console.log("Couldn't send crash report!", err);
        if (this._isMounted) {
          this.setState({
            error: null,
            sendLoading: false,
          });
        }
      });
  }

  _dismissSnackbar() {
    this.setState({snackbarVisible: false});
  }

  onErrorMethod(error) {
    this.setState({error});
  }

  static getDerivedStateFromError(error) {
    return {error};
  }

  componentDidCatch(error) {
    this.setState({error});
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    if (this.state.error) {
      return (
        <Portal>
          <Modal visible={true} onDismiss={() => this._hideModal()}>
            <Card style={{margin: width * 0.05}}>
              <Card.Content>
                <Title>Oops, something went wrong...</Title>
                <Paragraph>
                  A critical error occured. This should not happen during normal
                  operation. Please let us know of this problem - we'll work on
                  it. It is recommended to restart the app.
                </Paragraph>
                <Paragraph style={{fontWeight: 'bold'}}>
                  Please note that reporting the problem will send error
                  information as well as a pseudonymized device fingerprint to
                  Exanion's servers. Please refer to the privacy policy for
                  further information.
                </Paragraph>
              </Card.Content>
              <Card.Actions>
                {this.state.sendLoading ? (
                  <ActivityIndicator animating={true} />
                ) : (
                  <>
                    <Button
                      mode="outlined"
                      icon="close-circle-outline"
                      style={{marginRight: 16}}
                      onPress={() => this._hideModal()}>
                      Close
                    </Button>
                    {config.CRASHREPORTER_ENDPONT ? (
                      <Button
                        mode="contained"
                        icon="send"
                        onPress={() => this._sendReport()}
                        duration={Snackbar.DURATION_MEDIUM}>
                        Send Report
                      </Button>
                    ) : null}
                  </>
                )}
              </Card.Actions>
            </Card>
          </Modal>
        </Portal>
      );
    }

    return this.props.children;
  }
}

export default ErrorReporter;
