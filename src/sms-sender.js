const getTwilioClient = require('./twilio-client');

const smsSender = async ({destination, message}) => {
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
