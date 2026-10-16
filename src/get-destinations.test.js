const getDestinations = require('./get-destinations');
const { connectDB } = require('./db-connect');


test('testing', async () => {
    process.env.NODE_ENV='dev'
    await connectDB();
    const destinations = await getDestinations({userId: '44085488-0091-707c-2208-9b6753027a15', configId: '4e81f061-d78e-471e-b079-e9b1083760ef'});

    expect(Array.isArray(destinations)).toBe(true);
})
