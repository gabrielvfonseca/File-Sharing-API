require("dotenv").config();
const { MongoClient } = require("mongodb");

// DB environment variables
const URL = process.env.MONGO_CONNECTION_URL;
const DATABASE = process.env.MONGO_DATABASE_NAME;

async function main() {
  // Create mongodb client
  const client = new MongoClient(URL);
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log("Database successfuly connected! 🌲");
  } catch (err) {
    console.log("Error while connecting to db: ⛔");
    console.error(err);
  } finally {
    await client.close();
  }
}

async function findFiles(id, collection) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(URL, { useUnifiedTopology: true }, (err, db) => {
      if (err) reject(err);
      db.db(DATABASE)
        .collection(collection)
        .findOne({ _id: id }, (err, results) => {
          if (err) throw err;
          resolve(results);
        });
    });
  });
}

async function pushFiles(element, collection) {
  MongoClient.connect(URL, (err, db) => {
    if (err) throw err;
    db.db(DATABASE)
      .collection(collection)
      .insertOne(element, (err, res) => {
        if (err) throw err;
        db.close();
        return true;
      });
  });
}

main(); // Test database connction at init!

module.exports = {
  findFiles,
  pushFiles,
};
