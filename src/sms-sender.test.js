const smsSender = require('./sms-sender');

test('sends an sms message', async () => {
    await smsSender({
        destination: { metadata: { phoneNumber: process.env.SMS_TO_NUMBER_TEST } },
        message: 'hello from jest at last',
    });
});
