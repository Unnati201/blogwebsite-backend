const { MongoClient } = require("mongodb");

const connection = async () => {
  const client = await MongoClient.connect(
    "mongodb+srv://uSingh:uSingh@cluster0.35udqsf.mongodb.net/?retryWrites=true&w=majority"
  );

  const db = client.db();

  return { db };
};

module.exports = { connection };

