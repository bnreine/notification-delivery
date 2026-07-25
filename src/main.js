const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');

async function runFn() {
  const client = new SQSClient({});

  console.log('starting service')

  while (true) {
    const response = await client.send(new ReceiveMessageCommand({
      QueueUrl: process.env.NOTIFICATION_DELIVERY_QUEUE_URL,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,
    }));

    for (const message of response.Messages ?? []) {
      console.log(JSON.stringify(message.Body));

      await client.send(new DeleteMessageCommand({
        QueueUrl: process.env.NOTIFICATION_DELIVERY_QUEUE_URL,
        ReceiptHandle: message.ReceiptHandle,
      }));
    }
  }
}

if (process.env.NODE_ENV !== 'dev') {
  runFn().catch(console.error);
}

module.exports.run = runFn;
