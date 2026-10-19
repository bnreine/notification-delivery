const slackSender = require('./slack-sender');

test('sends a slack message', async () => {
    await slackSender({
        destination: { metadata: { webhookUrl: process.env.webhookUrl } },
        message: 'hello from jest',
    });
});
