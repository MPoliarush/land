const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let database;

async function connectToDatabase() {
  const client = await MongoClient.connect('mongodb+srv://merienf8118:o5EeXNp7xgkgVNST@cluster0.mfmog5n.mongodb.net/test_maps');
  database = client.db('catalog');
}

function getDb() {
  if (!database) {
    throw { message: 'Database not connected!' };
  } else {  message: 'Database connected!'}
  return database;
}

module.exports = {
  connectToDatabase: connectToDatabase,
  getDb: getDb,
};