const {getDbPool} = require('./db-connect')


const getDestinations = async ({userId, configId}) => {
    const dbPool = getDbPool('write_read_rds_db');

    const response = await dbPool.query(
        'select c."status" as "consentStatus", v."status" as "verifyStatus", d."userId" as "userId", d."channelType" as "channelType", d."metadata" as "metadata" from "Destination" as d inner join "NotificationPreference" as np on d."id"=np."destinationId" left join "Verify" as v on d."id" = v."destinationId" left join "Consent" as c on d."id" = c."destinationId"   where "userId"=$1 and (d."deleted" is null or d."deleted" = false)  and np."configId"=$2;',
        [userId, configId]
    );

    return response.rows
}

module.exports = getDestinations;