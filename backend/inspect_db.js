const mongoose = require('mongoose');
require('dotenv').config();

async function inspectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('CONNECTED TO DATABASE:', process.env.MONGO_URI);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n--- COLLECTIONS & DOCUMENT COUNTS ---');
    if (collections.length === 0) {
      console.log('No collections created yet in this database.');
    }
    for (let col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`Collection: "${col.name}" -> ${count} record(s)`);
      if (count > 0) {
        const samples = await mongoose.connection.db.collection(col.name).find({}).limit(2).toArray();
        console.log(' Sample data:', JSON.stringify(samples, null, 2));
      }
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error('Inspection failed:', err.message);
  }
}

inspectDB();
