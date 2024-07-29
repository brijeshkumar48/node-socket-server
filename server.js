const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');

// Load environment variables from .env file
require('dotenv').config();

const NODE_JS_PORT = process.env.NODE_JS_PORT;

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Allow CORS for all origins
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST'] // Allow specific methods
}));

// Middleware to parse JSON bodies
app.use(bodyParser.json());


const userSockets = new Map();

io.on('connection', (socket) => {
    console.log('===A user connected===');

    // Handle initial data from the client
    socket.on('initialData', (data) => {
        const { userId, orgId } = data;
        userSockets.set(socket, userId);
        console.log(`Received userId: ${userId}, orgId: ${orgId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        const userId = userSockets.get(socket);
        userSockets.delete(socket);
        console.log(`${userId} user disconnected`);
    });
});

app.post('/file-upload-status', (req, res) => {
    const data = req.body;
    console.log("=====File uploaded successfully========")
    io.emit('fileUploadStatus', data);
    res.status(200).json({ message: 'File upload status updated' });
});

// Start the server using PORT from environment variables
server.listen(NODE_JS_PORT, '0.0.0.0', () => {
    console.log(`Node.js server is running on port ${NODE_JS_PORT}`);
});
