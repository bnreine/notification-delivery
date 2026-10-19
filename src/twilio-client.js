const twilio = require('twilio');
const {
    SecretsManagerClient,
    GetSecretValueCommand,
} = require('@aws-sdk/client-secrets-manager');

let client;

// Locally (NODE_ENV=dev) the keys come from env vars; otherwise fetched once and cached in memory for the life of the process
async function getTwilioClient() {
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

module.exports = getTwilioClient;
