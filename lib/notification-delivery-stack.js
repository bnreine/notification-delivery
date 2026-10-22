const {
  Stack,
  Fn,
  aws_ec2: ec2,
  aws_ecs: ecs,
  aws_sqs: sqs,
  aws_ssm: ssm,
  aws_kms: kms,
  aws_logs: logs,
  aws_secretsmanager: secretsmanager,
} = require('aws-cdk-lib');

const ECS_CLUSTER_NAME_EXPORT = 'SharedNotificationClusterName';
const CAPACITY_PROVIDER_NAME_EXPORT = 'EcsNotificationCapacityProvider';
const DELIVERY_QUEUE_SSM_PARAMETER = '/notifications/NotificationDeliveryQueue/arn';

class NotificationDeliveryStack extends Stack {
  /**
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, 'Vpc', {
      vpcId: 'vpc-084bacc70db0dcefd',
    });

    const cluster = ecs.Cluster.fromClusterAttributes(this, 'Cluster', {
      clusterName: Fn.importValue(ECS_CLUSTER_NAME_EXPORT),
      vpc,
      securityGroups: [],
    });

    const deliveryQueueArn = ssm.StringParameter.valueForStringParameter(this, DELIVERY_QUEUE_SSM_PARAMETER);
    const notificationDeliveryQueue = sqs.Queue.fromQueueArn(this, 'NotificationsDeliveryQueue', deliveryQueueArn);

    const logGroup = new logs.LogGroup(this, 'LogGroup', {
      logGroupName: '/ecs/notification-delivery',
      retention: logs.RetentionDays.ONE_WEEK,
    });

    const taskDefinition = new ecs.Ec2TaskDefinition(this, 'TaskDefinition', {});

      const RDSReadOnlyCredentialsSecret = secretsmanager.Secret.fromSecretCompleteArn(
          this,
          'RDSReadOnlyCredentialsSecret',
          'arn:aws:secretsmanager:us-east-1:010273536955:secret:readonly_rds_db-nUv5YB'
      );

    const twilioMessageSenderSecret = secretsmanager.Secret.fromSecretNameV2(
        this,
        'TwilioMessageSenderSecret',
        'notificationsTwilioMessageSender'
    );

    taskDefinition.addContainer('App', {
      image: ecs.ContainerImage.fromAsset('.', { file: 'Dockerfile' }),
      memoryReservationMiB: 256,
      logging: ecs.LogDrivers.awsLogs({
        logGroup,
        streamPrefix: 'notification-delivery',
      }),
      environment: {
        NOTIFICATION_DELIVERY_QUEUE_URL: notificationDeliveryQueue.queueUrl,
          DB_SECRET_ARN:  RDSReadOnlyCredentialsSecret.secretArn,
          TWILIO_SECRET_ARN: twilioMessageSenderSecret.secretArn,
          TWILIO_ACCOUNT_SID: 'AC62aabf7bd88076aa222941d87b1b6a42',
          WHATSAPP_FROM_NUMBER: '+14155238886',
          SMS_FROM_NUMBER: '+18573756818',
      },
    });




      RDSReadOnlyCredentialsSecret.grantRead(taskDefinition.taskRole);
    twilioMessageSenderSecret.grantRead(taskDefinition.taskRole);

    const encryptionKey = kms.Key.fromKeyArn(
        this,
        'NotificationsEncryptionKey',
        ssm.StringParameter.valueForStringParameter(this, '/notifications/kms-shared-key')
    );
    encryptionKey.grantDecrypt(taskDefinition.taskRole);

    notificationDeliveryQueue.grantConsumeMessages(taskDefinition.taskRole);

    const slackWebhookSecret = secretsmanager.Secret.fromSecretNameV2(this, 'SlackWebhookSecret', 'fake-slack-webhook');
    slackWebhookSecret.grantRead(taskDefinition.taskRole);

    new ecs.Ec2Service(this, 'NotificationDeliveryService', {
      cluster,
      taskDefinition,
      desiredCount: 0,
      capacityProviderStrategies: [
        {
          capacityProvider: Fn.importValue(CAPACITY_PROVIDER_NAME_EXPORT),
          weight: 1,
        },
      ],
    });
  }
}

module.exports = { NotificationDeliveryStack };
