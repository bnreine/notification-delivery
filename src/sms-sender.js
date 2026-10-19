const getTwilioClient = require('./twilio-client');

const smsSender = async ({destination, message}) => {
    if (destination.consentStatus !== 'consented' || destination.verifyStatus !== 'verified') {
        console.log('sms skipped, destination not consented and verified', destination.id);
        return;
    }

    const phoneNumber = destination.metadata.phoneNumber;
    const twilioClient = await getTwilioClient();
    const result = await twilioClient.messages.create({
        from: process.env.SMS_FROM_NUMBER,
        to: phoneNumber,
        body: message,
    });
    console.log('sms sent', result.sid);
};

module.exports = smsSender;
