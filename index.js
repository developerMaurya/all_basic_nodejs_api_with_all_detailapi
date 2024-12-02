
// import express from 'express';
// import mysql from 'mysql2';
// import bodyParser from 'body-parser';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import http from 'http'; // Import http to use with socket.io
// import { Server } from 'socket.io'; // Import Server from socket.io
// import route from './routes/userrouts.js';
// import path from "path";

// dotenv.config();
// import { fileURLToPath } from "url";

// // Create __dirname equivalent in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const app = express();
// const server = http.createServer(app); // Create a server instance
// const io = new Server(server, {
//     cors: {
//         origin: "http://localhost:3000", // Adjust the origin as per your front-end setup
//         methods: ["GET", "POST"]
//     }
// });

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, "public")));
// app.set("view engine", "ejs");

// app.use(cors());

// const PORT = process.env.PORT || 7000;

// const connection = mysql.createConnection({
//     host: process.env.MYSQL_HOST,
//     user: process.env.MYSQL_USER,
//     password: process.env.MYSQL_PASSWORD,
//     database: process.env.MYSQL_DATABASE
// });

// connection.connect((err) => {
//     if (err) {
//         return;
//     }
// });

// app.use("/api", route);
// // create a google track location api 
// app.get("/", (req, res) => {
//     res.render("index", { from: null, to: null });
// });

// app.post("/track", (req, res) => {
//     const { from, to } = req.body;
//     res.render("index", { from, to });
// });
// // Socket.IO connection
// io.on('connection', (socket) => {
//     console.log('a user connected:', socket.id);

//     // Listen for messages from the front-end
//     socket.on('sendMessage', (message) => {
//         console.log('Message received from front-end:', message);
//         // You can handle the message here and, if needed, send a response back
//         socket.emit('receiveMessage', `Message received: ${message}`);
//     });

//     // Handle disconnection
//     socket.on('disconnect', () => {
//         console.log('user disconnected');
//     });
// });

// server.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

// export default connection;




import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http'; // Import http to use with socket.io
import { Server } from 'socket.io'; // Import Server from socket.io
import route from './routes/userrouts.js';
import path from "path";
import webpush from "web-push"; // Import web-push

dotenv.config();
import { fileURLToPath } from "url";

// Create __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = http.createServer(app); // Create a server instance
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Adjust the origin as per your front-end setup
        methods: ["GET", "POST"]
    }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.use(cors());

const PORT = process.env.PORT || 7000;

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

connection.connect((err) => {
    if (err) {
        return;
    }
});

app.use("/api", route);

// Web Push Setup
const publicVapidKey =
  "BMW8N7WxK6jqxErkg6RSR3qtK9u0Mpl1HcsTgoGILX4I4b4S0_VFkwKpTLWS0BJ6HqSyEdpofE8n4VVszVAYDzs";
const privateVapidKey = "wZLyg7kR-zln6kynHJiSbgdyRl8etn3bwNdWSQJynGg";

webpush.setVapidDetails(
  "mailto:test@test.com",
  publicVapidKey,
  privateVapidKey
);
app.get("/webpush", (req, res) => {
    res.render("webpushindex");
});
// Web Push Route
app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  // Send 201 - resoconurce created
  res.status(201).json({});

  // Create payload
  const payload = JSON.stringify({ title: "Push Test", body: "This is a test notification!" });

  // Send push notification
  webpush
    .sendNotification(subscription, payload)
    .catch(err => console.error("Error sending push notification", err));
});

app.get("/", (req, res) => {
    res.render("index", { from: null, to: null });
});

app.post("/track", (req, res) => {
    const { from, to } = req.body;
    res.render("index", { from, to });
});

// Socket.IO connection
io.on('connection', (socket) => {

    // Listen for messages from the front-end
    socket.on('sendMessage', (message) => {
        // You can handle the message here and, if needed, send a response back
        socket.emit('receiveMessage', `Message received: ${message}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default connection;
