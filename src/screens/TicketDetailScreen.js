import React, {useState, useContext, useEffect} from 'react';
import {View, Text} from 'react-native';
import {
  Avatar,
  Portal,
  Dialog,
  Paragraph,
  Button,
  Appbar,
} from 'react-native-paper';
import {AuthContext} from '../navigation/AuthProvider';
import {GiftedChat, MessageText, Bubble} from 'react-native-gifted-chat';
import Loading from '../components/Loading';
import HTMLView from 'react-native-htmlview';
import ZammadColors from '../components/ZammadColors';
import {TicketArticle} from 'zammad-js-api';
import Snackbar from 'react-native-snackbar';
import TicketSettings from '../components/TicketSettings';
import Header from '../components/Header';

/**
 * Display certain messages on the side of the current user,
 * use a dummy id for that purpose
 */
const DUMMY_ID_FOR_CURRENT_USER = Number.MAX_SAFE_INTEGER;

const zammadArticlesToMessages = articles => {
  let messages = [];
  articles.forEach(a => {
    let msg = {
      _id: a.id,
      text: {contentType: a.contentType, body: a.body, internal: a.internal},
      originalArticle: a,
      createdAt: Date.parse(a.createdAt),
      user: {
        _id:
          a.sender == 'System' || a.sender == 'Agent'
            ? DUMMY_ID_FOR_CURRENT_USER
            : a.createdById,
        //name: 'React Native',
        //avatar: 'https://placeimg.com/140/140/any',
      },
    };

    messages.push(msg);
  });
  return messages;
};

const customMessageTextRenderer = ({currentMessage, ...rest}) => {
  if (currentMessage.text.contentType === 'text/plain') {
    currentMessage.text = currentMessage.text.body;
    return <MessageText currentMessage={currentMessage} {...rest} />;
  } else if (currentMessage.text.contentType === 'text/html') {
    return (
      <View style={{padding: 3}}>
        <HTMLView value={`<div>${currentMessage.text.body}</div>`} />
      </View>
    );
  } else {
    currentMessage.text = '[Internal Error] Unsupported content type!';
    return <MessageText currentMessage={currentMessage} {...rest} />;
  }
};

const customAvatarRenderer = props => {
  return (
    <Avatar.Icon
      style={{backgroundColor: ZammadColors.AvatarBackgroundColor}}
      icon="help"
      size={30}
    />
  );
};

/**
 * Returns the latest article that was not sent by agent/ system
 * @param {*} articles Array of all articles, first element is latest article
 */
const lastArticleFromCustomer = (articles = []) => {
  for (const article of articles) {
    if (article.sender !== 'System' && article.sender !== 'Agent')
      return article;
  }
};

const TicketDetailScreen = ({navigation, route}) => {
  const ticket = route.params.ticket;
  const [articles, setArticles] = useState();
  const [sendConfirmation, setSendConfirmation] = useState({});
  const [isTyping, setIsTyping] = useState(true);
  const [detailedArticle, setDetailedArticle] = useState({}); //show details for a single article when pressed
  const [settingsVisible, setSettingsVisible] = useState(false);
  const {user} = useContext(AuthContext);

  if (!ticket) {
    throw new Error(
      "Can't render TicketDetailScreen if ticket is not given in route",
    );
  }

  useEffect(() => {
    let didCancel = false;
    ticket.articles(user.api).then(_articles => {
      if (!didCancel) setArticles(_articles.reverse());
    });
    return () => {
      didCancel = true;
    };
  }, []);

  const updateArticles = () => {
    setArticles(null);
    ticket.articles(user.api).then(_articles => {
      setArticles(_articles.reverse());
    });
  };

  navigation.setOptions({
    title: `${ticket.title}`,
    subtitle: `#${ticket.number}`,
    header: props => (
      <Header {...props}>
        <Appbar.Action
          icon="refresh"
          color={ZammadColors.MenuTextReadable}
          onPress={() => updateArticles()}
        />
        <Appbar.Action
          icon="pencil"
          color={ZammadColors.MenuTextReadable}
          onPress={() => setSettingsVisible(true)}
        />
      </Header>
    ),
  });

  const sendResponseToLast = messages => {
    const respondTo = lastArticleFromCustomer(articles || []) || {};
    setSendConfirmation({
      ticketId: ticket.id,
      body: messages[0].text,
      internal: false,
      type: respondTo.type || 'note',
      to: respondTo.from,
      cc: respondTo.cc,
    });
  };

  const sendConfirmed = async () => {
    setIsTyping(true);
    const toSend = sendConfirmation;
    setSendConfirmation({});
    try {
      const newArticle = await TicketArticle.create(user.api, toSend);
      setArticles(GiftedChat.append(articles, newArticle));
      setIsTyping(false);
    } catch (err) {
      console.log('Error in TicketDetailScreen.sendConfirmed: ', err);
      Snackbar.show({
        text: "Couldn't send: " + String(err.message),
        duration: Snackbar.LENGTH_LONG,
      });
    }
  };

  const customBubbleRenderer = props => {
    const internal = props.currentMessage.text.internal;

    return (
      <Bubble
        {...props}
        touchableProps={{
          onPress: () =>
            setDetailedArticle(props.currentMessage.originalArticle),
        }}
        textStyle={{
          right: {
            color: ZammadColors.ChatBubbleText,
          },
          left: {
            color: ZammadColors.ChatBubbleText,
          },
        }}
        wrapperStyle={{
          left: {
            backgroundColor: ZammadColors.ChatBubbleThem,
            borderColor: ZammadColors.ChatBubbleThemBorderColor,
            borderRadius: ZammadColors.ChatBubbleThemBorderRadius,
            borderWidth: 1,
          },
          right: {
            backgroundColor: ZammadColors.ChatBubbleUs,
            borderColor: internal
              ? ZammadColors.ChatBubbleInternalBorderColor
              : ZammadColors.ChatBubbleUsBorderColor,
            borderRadius: ZammadColors.ChatBubbleUsBorderRadius,
            borderWidth: internal ? 3 : 1,
            borderStyle: internal ? 'dotted' : 'solid',
          },
        }}
        timeTextStyle={{
          left: {
            color: ZammadColors.ChatBubbleTime,
          },
          right: {
            color: ZammadColors.ChatBubbleTime,
          },
        }}
      />
    );
  };

  if (!articles) return <Loading />;

  return (
    <View style={{flex: 1}}>
      {/* Chat element showing all articles */}
      <GiftedChat
        messages={zammadArticlesToMessages(articles)}
        user={{
          _id: DUMMY_ID_FOR_CURRENT_USER,
        }}
        //renderActions={props => <Text>test</Text>}
        renderMessageText={customMessageTextRenderer}
        renderBubble={customBubbleRenderer}
        renderAvatar={customAvatarRenderer}
        renderLoading={() => <Loading />}
        onSend={sendResponseToLast}
        isTyping={isTyping}
        listViewProps={{
          style: {
            backgroundColor: ZammadColors.ChatBackground,
          },
        }}
      />
      {/* Dialog to edit setting of the ticket, e.g. assigned to/ open-closed, priority */}
      <TicketSettings
        ticket={ticket}
        onDone={() => setSettingsVisible(false)}
        visible={settingsVisible}
      />
      {/* Dialog to show details of a single article */}
      <Portal>
        <Dialog
          visible={detailedArticle.id ? true : false}
          onDismiss={() => setDetailedArticle({})}
          dismissable={true}>
          <Dialog.Title>Message Details</Dialog.Title>
          <Dialog.Content>
            {detailedArticle.from ? (
              <Paragraph>
                <Text style={{fontWeight: 'bold'}}>From: </Text>
                {String(detailedArticle.from)}
              </Paragraph>
            ) : null}
            {detailedArticle.to ? (
              <Paragraph>
                <Text style={{fontWeight: 'bold'}}>To: </Text>
                {String(detailedArticle.to)}
              </Paragraph>
            ) : null}
            {detailedArticle.cc ? (
              <Paragraph>
                <Text style={{fontWeight: 'bold'}}>Cc: </Text>
                {String(detailedArticle.cc)}
              </Paragraph>
            ) : null}
            <Paragraph>
              <Text style={{fontWeight: 'bold'}}>Internal: </Text>
              {detailedArticle.internal ? 'Yes' : 'No'}
            </Paragraph>
            <Paragraph>
              <Text style={{fontWeight: 'bold'}}>Channel: </Text>
              {String(detailedArticle.type)}
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button icon="close" onPress={() => setDetailedArticle({})}>
              Close
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      {/* Dialog to show send confirmation for replies etc. */}
      <Portal>
        <Dialog
          visible={sendConfirmation.ticketId ? true : false}
          onDismiss={() => setSendConfirmation({})}
          dismissable={true}>
          <Dialog.Title>Confirm Send</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              <Text style={{fontWeight: 'bold'}}>Type: </Text>
              {String(sendConfirmation.type)}
            </Paragraph>
            <Paragraph>
              <Text style={{fontWeight: 'bold'}}>Internal: </Text>
              {sendConfirmation.internal ? 'Yes' : 'No'}
            </Paragraph>
            <Paragraph>
              <Text style={{fontWeight: 'bold'}}>To: </Text>
              {String(sendConfirmation.to)}
            </Paragraph>
            <Paragraph>
              <Text style={{fontWeight: 'bold'}}>Cc: </Text>
              {String(sendConfirmation.cc)}
            </Paragraph>
            <Paragraph>
              <Text style={{fontWeight: 'bold'}}>Message: </Text>
              {String(sendConfirmation.body)}
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button icon="close" onPress={() => setSendConfirmation({})}>
              Cancel
            </Button>
            <Button icon="send" onPress={() => sendConfirmed()}>
              Send
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

export default TicketDetailScreen;
