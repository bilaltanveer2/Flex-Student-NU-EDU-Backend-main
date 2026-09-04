const mongoose = require("mongoose");

const ensureUserIndexes = async () => {
  const usersCollection = mongoose.connection.collection("users");
  const indexes = await usersCollection.indexes();
  const loginIdIndex = indexes.find((index) => index.name === "loginId_1");

  if (!loginIdIndex) {
    await usersCollection.createIndex(
      { loginId: 1 },
      { unique: true, sparse: true, name: "loginId_1" }
    );
    return;
  }

  // Fix old non-sparse unique index that blocks multiple null loginId values.
  if (!loginIdIndex.sparse) {
    await usersCollection.dropIndex("loginId_1");
    await usersCollection.createIndex(
      { loginId: 1 },
      { unique: true, sparse: true, name: "loginId_1" }
    );
  }
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing in environment variables.");
  }

  await mongoose.connect(mongoUri);
  await ensureUserIndexes();
  console.log("MongoDB connected");
};

module.exports = connectDB;
