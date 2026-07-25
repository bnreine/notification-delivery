const { Stage } = require('aws-cdk-lib');
const { NotificationDeliveryStack } = require('./notification-delivery-stack');

class ProductionStage extends Stage {
  constructor(scope, id, props) {
    super(scope, id, props);

    new NotificationDeliveryStack(this, 'NotificationDeliveryStack', props);
  }
}

module.exports = { ProductionStage };
