const { Worker } = require('bullmq');

const { MESSAGE_QUEUE } = require('./queues');

module.exports = (ws, req) => {
  const sessionId = req.session.id;
  const hasTumblrSession = Boolean(req.session.grant && req.session.grant.response && !req.session.grant.response.error);

  if (!hasTumblrSession) {
    ws.close('No tumblr session');
    return;
  }

  const worker = new Worker(MESSAGE_QUEUE(sessionId), async (job) => {
    ws.send(JSON.stringify(job.data));
  });

  ws.on('message', (message) => {
    console.log(`Received message ${message} from user ${sessionId}`);
  });

  ws.on('close', async () => {
    await worker.close();
  });
};
