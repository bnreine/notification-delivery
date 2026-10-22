const { KMSClient, DecryptCommand } = require('@aws-sdk/client-kms');

const kmsClient = new KMSClient({});

// Reverses oauth-connections' encrypt(): base64 KMS ciphertext -> plaintext.
// A symmetric KMS ciphertext embeds its key id, so no KeyId is needed here.
const decrypt = async (ciphertext) => {
    const { Plaintext } = await kmsClient.send(
        new DecryptCommand({ CiphertextBlob: Buffer.from(ciphertext, 'base64') })
    );
    return Buffer.from(Plaintext).toString('utf8');
};

module.exports = decrypt;
