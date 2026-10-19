const twilio = require('twilio');
const {
    SecretsManagerClient,
    GetSecretValueCommand,
} = require('@aws-sdk/client-secrets-manager');

let client;

// Locally (NODE_ENV=dev) the keys come from env vars; otherwise fetched once and cached in memory for the life of the process
async function getClient() {
    if (!client) {
        let secret;
        if (process.env.NODE_ENV === 'dev') {
            secret = {
                sid: process.env.TWILIO_API_KEY_SID,
                secret: process.env.TWILIO_API_KEY_SECRET,
            };
        } else {
            const secretsClient = new SecretsManagerClient({});
            const { SecretString } = await secretsClient.send(
                new GetSecretValueCommand({ SecretId: process.env.TWILIO_SECRET_ARN })
            );
            secret = JSON.parse(SecretString);
        }

        client = twilio(secret.sid, secret.secret, {
            accountSid: process.env.TWILIO_ACCOUNT_SID,
        });
    }
    return client;
}

const whatsappSender = async ({destination, message}) => {
    const phoneNumber = destination.metadata.phoneNumber;
    const twilioClient = await getClient();

    const result = await twilioClient.messages.create({
        from: `whatsapp:${process.env.WHATSAPP_FROM_NUMBER}`,
        to: `whatsapp:${phoneNumber}`,
        body: message,
    });
    console.log('whatsapp sent', result.sid);
};

module.exports = whatsappSender;
