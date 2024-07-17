const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
const uri = "mongodb://mongohost";
const client = new MongoClient(uri);

app.use(express.json()); // For parsing application/json

// Connect to MongoDB
async function connectDB() {
    await client.connect();
    console.log("Connected successfully to MongoDB");
    const db = client.db("game");
    const rooms = db.collection("rooms");

    // Create a TTL index to automatically delete rooms after 6 hours (21600 seconds)
    await rooms.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 21600 });

    return { rooms };
}

// This function now returns a Promise
function createUniqueRoomCode(db, length = 6) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    let unique = false;

    // Function to generate a random code
    const generateCode = () => {
        result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
    };

    // Check the uniqueness of the code in the database
    const checkUniqueness = async (code) => {
        const room = await db.collection("rooms").findOne({ code });
        return !room; // If room does not exist, code is unique
    };

    return new Promise(async (resolve, reject) => {
        while (!unique) {
            generateCode();
            unique = await checkUniqueness(result);
        }
        resolve(result);
    });
}

// Adjusted endpoint to use the new asynchronous function
app.post("/rooms/create", async (req, res) => {
    const username = req.body.username; // Username of the room creator
    if (!username) {
        return res.status(400).send("Username is required");
    }

    // Use the new function to ensure the room code is unique
    const roomCode = await createUniqueRoomCode(req.db);
    const room = {
        code: roomCode,
        creator: username,
        createdAt: new Date(),
        players: [username] // Initially, the room has only the creator
    };

    await req.db.rooms.insertOne(room);
    res.status(201).send({ roomCode });
});

// Middleware to connect to the database
async function dbMiddleware(req, res, next) {
    req.db = await connectDB();
    next();
}

app.use(dbMiddleware);

// Endpoint to create a room
app.post("/rooms/create", async (req, res) => {
    const username = req.body.username; // Username of the room creator
    if (!username) {
        return res.status(400).send("Username is required");
    }

    const roomCode = generateRoomCode();
    const room = {
        code: roomCode,
        creator: username,
        createdAt: new Date(),
        players: [username] // Initially, the room has only the creator
    };

    await req.db.rooms.insertOne(room);
    res.status(201).send({ roomCode });
});

// Endpoint for players to join a room
app.post("/rooms/join", async (req, res) => {
    const { username, roomCode } = req.body;
    if (!username || !roomCode) {
        return res.status(400).send("Username and room code are required");
    }

    const result = await req.db.rooms.findOneAndUpdate(
        { code: roomCode },
        { $addToSet: { players: username } }, // Ensure usernames are unique in the room
        { returnDocument: 'after' }
    );

    if (!result.value) {
        return res.status(404).send("Room not found");
    }

    res.status(200).send({ message: "Joined room successfully", room: result.value });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});