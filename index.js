require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require('express');
const app = express();
const cors = require('cors');

// Set CORS options to allow requests from any origin
const corsOptions = {
  origin: '*',
};

app.use(cors(corsOptions));


app.use(express.json());

// MongoDB connection U
app.use(async (req, res, next) => {
  try {
    if (typeof client == 'undefined') {
      client = new MongoClient(process.env.DATABASE_URL, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        }
      });
      await client.connect();
      collection = await client.db("test").collection("todos");
    }
    console.log('MongoDB connected !')
    next();
  } catch (error) {
    console.error("MongoDB connection error:", error);
    res.status(500).send("Internal Server Error");
  }
});


//routing path
app.get('/', async (req, res) => {
    try {
        // Query: retrieve all documents in the collection
        const documents = await collection.find({}).toArray();

        // Send the data as JSON
        res.json(documents);
    } catch (error) {
      res.status(500).send({message: error.message});
    }
  }
);

//routing path
app.post('/addTodo', async (req, res) => {
  try {
    const todoToAdd = req.body;
    await collection.insertOne(todoToAdd, { upsert: true, returnDocument: 'after' });
    res.status(201).json(todoToAdd);
  } catch (error) {
      res.status(400).send({message: error.message});
  }
});

app.put('/edit/:id', async function (req, res) {
  try {
    await collection.updateOne({ _id: new ObjectId(req.params.id) },{ $set: { value: req.body.value } });
    res.status(201).json('Your todo has been edited!');
  } catch (error) {
      res.status(400).send({message: error.message});
  }
});

app.delete('/delete/:id', async function (req, res) {
  try {
    await collection.deleteOne({_id: new ObjectId(req.params.id)});
    res.status(201).json('Your todo has been deleted!');
  } catch (error) {
      res.status(500).send({message: error.message});
  }
});

app.delete('/delete-all', async function (req, res) {
  try {
    await collection.deleteMany({ });
    res.status(201).json('Your todo list is now empty!');
  } catch (error) {
      res.status(500).send({message: error.message});
  }
});


// Start the server
app.listen(process.env.PORT || 3000, () => {
  console.log('Server started on port 3000');
});