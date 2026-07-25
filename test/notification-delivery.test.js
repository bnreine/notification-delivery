const {run} = require('../src/main.js')

// const cdk = require('aws-cdk-lib/core');
// const { Template } = require('aws-cdk-lib/assertions');
// const NotificationDelivery = require('../lib/notification-delivery-stack');

// example test. To run these tests, uncomment this file along with the
// example resource in lib/notification-delivery-stack.js
test('testing', async () => {
    const ret = await run()
    expect(1).toBe(1);
}, 30000);
