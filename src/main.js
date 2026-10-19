const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');
const {connectDB} = require('./db-connect')
const getDestinations = require("./get-destinations");
const whatsappSender = require("./whatsapp-sender");

// const SLACK_SECRET_ID = 'fake-slack-webhook';
//
// let webhookUrl;
//
// async function getWebhookUrl(secretsClient) {
//   if (!webhookUrl) {
//     const { SecretString } = await secretsClient.send(new GetSecretValueCommand({ SecretId: SLACK_SECRET_ID }));
//     webhookUrl = JSON.parse(SecretString).webhook;
//   }
//   return webhookUrl;
// }
//
// async function sendSlackMessage(secretsClient, text) {
//   const response = await fetch(await getWebhookUrl(secretsClient), {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ text }),
//   });
//
//   if (!response.ok) {
//     throw new Error(`Slack webhook responded ${response.status}: ${await response.text()}`);
//   }
// }

const senderMap = {
    whatsapp: whatsappSender,
    // sms: '',
    // slack: '',
    default: async ({destination})=> {
        throw new Error(`${destination.channelType} not implemented for sending yet`)
    }
}

async function runFn() {
  const client = new SQSClient({});
  // const secretsClient = new SecretsManagerClient({});
    await connectDB()

  while (true) {
    const response = await client.send(new ReceiveMessageCommand({
      QueueUrl: process.env.NOTIFICATION_DELIVERY_QUEUE_URL,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,
    }));

    for (const message of response.Messages ?? []) {
      try {
        const messageBody = JSON.parse(message.Body);
        const {userId, eventPayload = {}, configId} = messageBody;
        const destinations = await getDestinations({userId, configId});
        console.log('number of destinations: ', destinations.length);
          console.log('config body: ', JSON.stringify(messageBody));

        for (const destination of destinations) {
            try{
                const sender = senderMap[destination.channelType] || senderMap.default;
                await sender({destination,message: eventPayload.message})
            } catch (err){
                console.error(err)
                // now move on so it doesn't disrupt sending other things
            }
        }

        await client.send(new DeleteMessageCommand({
          QueueUrl: process.env.NOTIFICATION_DELIVERY_QUEUE_URL,
          ReceiptHandle: message.ReceiptHandle,
        }));
      } catch (err) {
        // The delete is skipped on failure, so the message is retried after the visibility timeout.
        console.error('failed to deliver message', message.MessageId, err);
      }
    }
  }
}

if (process.env.NODE_ENV !== 'dev') {
  runFn().catch(console.error);
}

module.exports.run = runFn;
