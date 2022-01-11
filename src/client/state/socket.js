import createDebug from 'debug';
import {
  websocketConnect,
  websocketDisconnect,
  websocketReceive,
  websocketSend,
  queueActionMap,
} from './actions';

const debug = createDebug('tagreplacer:ws');

const expectedCloseCodes = [4000];

const socketMiddleware = () => {
  let socket = null;

  const onOpen = store => (event) => {
    debug('open', event.target.url);
    // store.dispatch(actions.wsConnected(event.target.url));
  };

  const onError = store => (event) => {
    debug('error', event);
  };
  
  const onClose = store => (event) => {
    debug('closed', event);
    if (expectedCloseCodes.includes(event.code)) return;
    store.dispatch(websocketConnect()); // TODO there should be a retry limit
  };

  const onMessage = store => (event) => {
    const payload = JSON.parse(event.data);
    debug('message', payload);
    if (payload.queueName && queueActionMap.hasOwnProperty(payload.queueName)) {
      const action = queueActionMap[payload.queueName];
      store.dispatch(action(payload));
    } else {
      store.dispatch(websocketReceive(payload));
    }
  };

  return store => next => action => {
    switch (action.type) {
      case websocketConnect.toString():
        if (socket !== null) {
          socket.close();
        }

        socket = new WebSocket(process.env.WEBSOCKET_HOST);

        socket.onmessage = onMessage(store);
        socket.onclose = onClose(store);
        socket.onerror = onError(store);
        socket.onopen = onOpen(store);

        break;
      case websocketDisconnect.toString():
        if (socket !== null) {
          socket.close();
        }
        socket = null;
        break;
      case websocketSend.toString():
        socket.send(JSON.stringify(action.payload));
        break;
      default:
        return next(action);
    }
  };
};

export default socketMiddleware();