const whatsappSender = require('./whatsapp-sender');

test('sends a whatsapp message', async () => {
    await whatsappSender({
        destination: { metadata: { phoneNumber: process.env.WHATSAPP_TO_NUMBER_TEST } },
        message: 'hello from jest system',
    });
});
