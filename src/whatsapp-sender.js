const getTwilioClient = require('./twilio-client');

const whatsappSender = async ({destination, message}) => {
    if (destination.consentStatus !== 'consented') {
        console.log('whatsapp skipped, destination not consented', destination.id);
        return;
    }

    const phoneNumber = destination.metadata.phoneNumber;
    const twilioClient = await getTwilioClient();
    const result = await twilioClient.messages.create({
        from: `whatsapp:${process.env.WHATSAPP_FROM_NUMBER}`,
        to: `whatsapp:${phoneNumber}`,
        body: message,
    });
    console.log('whatsapp sent', result.sid);
};

module.exports = whatsappSender;
