const { MongoClient } = require("mongodb");
require("dotenv").config({
  path: "D:\\Register4u_Pro\\Register4u_Pro_API\\.env",
});

async function run() {
  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db("test"); // Default usually 'test' or from URI
    // Check actual DB name from URI if possible, usually it's in the string
    // Assuming 'test' or just listing databases

    // Better: List databases to find the right one
    const dbs = await client.db().admin().listDatabases();
    console.log(
      "Databases:",
      dbs.databases.map((d) => d.name)
    );

    // Try finding visitor in 'test' first (standard mongoose default)
    const visitors = client.db("test").collection("visitors");
    const query = { visitorId: "CA1001" };
    const visitor = await visitors.findOne(query);

    if (visitor) {
      console.log(`\n✅ FOUND CA1001 in 'test' DB`);
      console.log(`PHOTO Field: '${visitor.photo}'`);
    } else {
      console.log("\n❌ CA1001 NOT FOUND in 'test' DB");
    }
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
