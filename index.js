const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

const userName = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;

const uri = `mongodb+srv://${userName}:${password}@cluster0.ashqk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const database = client.db("user-management-system-db");
    const collectionNames = await database.listCollections().toArray();

    app.get("/users/:email", async (req, res) => {
      const { email } = req.params;
      const data = await database.collection(email).find().toArray();
      res.send(data);
    });

    app.get("/users/:email/:id", async (req, res) => {
      const { email, id } = req.params;
      const users = await database.collection(email).find().toArray();

      const data = users.find((user) => user._id.toString() === id);

      res.send(data);
    });

    app.post("/users/:email/:id", async (req, res) => {
      const { email, id } = req.params;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: req.body.name,
          email: req.body.email,
          gender: req.body.gender,
          status: req.body.status,
        },
      };
      // console.log(req.body);
      const result = await database
        .collection(email)
        .updateOne(filter, updateDoc, options);

      res.send(result);
    });

    app.delete("/users/:email/:id", async (req, res) => {
      const { email, id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await database.collection(email).deleteOne(query);

      res.send(result);
    });

    app.get("/users/collection", (req, res) => {
      res.send("<h1>This is user collection</h1>");
    });

    app.post("/add-user", async (req, res) => {
      const { creator, createdUser } = req.body;

      if (!collectionNames.includes(creator)) {
        database.collection(creator);
      }
      await database.collection(creator).insertOne(createdUser);
      const data = await database.collection(creator).find().toArray();
      res.send(data);
      //   console.log(creator, createdUser);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("<h1>Welcome</h1>");
});

app.listen(port, () => {
  console.log("Server is running...");
});
