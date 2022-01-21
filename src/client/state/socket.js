import createDebug from 'debug';
import {
  websocketConnect,
  websocketConnected,
  websocketDisconnect,
  websocketDisconnected,
  websocketReceive,
  websocketSend,
  jobTypeActionMap,
} from './actions';

const debug = createDebug('tagreplacer:ws');

const expectedCloseCodes = [4000];

const socketMiddleware = () => {
  let socket = null;

  const onOpen = store => (event) => {
    debug('open', event.target.url);
    store.dispatch(websocketConnected());
  };

  const onError = () => (event) => {
    debug('error', event);
  };
  
  const onClose = store => (event) => {
    debug('closed', event);
    store.dispatch(websocketDisconnected());
    if (expectedCloseCodes.includes(event.code)) return;
    store.dispatch(websocketConnect()); // TODO there should be a retry limit
  };

  const onMessage = store => (event) => {
    const payload = JSON.parse(event.data);
    debug('message', payload);
    if (payload.jobType && jobTypeActionMap.hasOwnProperty(payload.jobType)) {
      const action = jobTypeActionMap[payload.jobType];
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