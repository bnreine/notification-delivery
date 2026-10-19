const slackSender = async ({destination, message}) => {
    const response = await fetch(destination.metadata.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
    });

    if (!response.ok) {
        throw new Error(`Slack webhook responded ${response.status}: ${await response.text()}`);
    }
    console.log('slack sent');
};

module.exports = slackSender;
