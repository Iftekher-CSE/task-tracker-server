const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { query } = require("express");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

//middlewares
app.use(cors());
app.use(express.json());

const uri = process.env.DB_URI;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

async function run() {
    try {
        // Collections
        const taskCollection = client.db("taskTracker").collection("allTask");
        const usersCollection = client.db("taskTracker").collection("users");

        // post a task
        app.post("/tasks", async (req, res) => {
            const task = req.body;
            const result = await taskCollection.insertOne(task);
            res.send(result);
        });

        // get task based on email query
        app.get("/allTasks/:email", async (req, res) => {
            const email = req.params.email;
            // console.log(email);
            const result = await taskCollection
                .find({ userEmail: email, $or: [{ completed: null }, { completed: false }] })
                .toArray();
            res.send(result);
        });

        // get completedTasks based on email query
        app.get("/completedTasks/:email", async (req, res) => {
            const email = req.params.email;
            // console.log(email);
            const result = await taskCollection.find({ userEmail: email, completed: true }).toArray();
            res.send(result);
        });

        // delete a task from db
        app.delete("/allTasks/:id", async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const result = await taskCollection.deleteOne({ _id: ObjectId(id) });
            res.send(result);
        });

        // make task completed and not completed
        app.put("/allTasks/completed/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const task = await taskCollection.findOne(filter);
            const updatedDoc = {
                $set: {
                    completed: !task.completed,
                },
            };
            const result = await taskCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });

        // update task details
        app.put("/updateTask/:id", async (req, res) => {
            const id = req.params.id;
            const taskDetails = req.body.updatedTaskDetails;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: { taskDetails: taskDetails },
            };
            const result = await taskCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });
    } finally {
    }
}

run().catch(err => console.log(err));

app.get("/", (req, res) => {
    res.send("Task-tracker Server is running");
});

app.listen(port, () => {
    console.log(`Task-tracker Server is running ${port}`);
});
