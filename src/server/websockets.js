const { Worker } = require('bullmq');

const { getMessageQueueName } = require('../queues');
const connection = require('../redis');

module.exports = (ws, req) => {
  const sessionId = req.session.id;
  const hasTumblrSession = Boolean(req.session.grant && req.session.grant.response && !req.session.grant.response.error);

  if (!hasTumblrSession) {
    ws.close(4000, 'No tumblr session');
    return;
  }

  // TODO should we use req.session.tumblr.name for the message queue instead?
  const worker = new Worker(getMessageQueueName(sessionId), async (job) => {
    ws.send(JSON.stringify(job.data));
  }, { connection });

  ws.on('close', async () => {
    await worker.close();
  });
};
