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
    origin: '*',
    methods: ['GET', 'POST']
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

// Endpoint to handle events from Django

// Main socket io api to communicate django-sockectio events======

app.post('/sapi/django-node-communication', (req, res) => {
    const data = req.body;

    console.log(`=====Trigger Event:====${data.event_name}===`)
    console.log("Received data:", data)

    const event_name = data.event_name
    io.emit(event_name, data);

    res.status(200).json({ message: data.message });
});



// ==================== Test APIs ================================
app.post('/send-message', (req, res) => {
    const data = req.body;
    io.emit('sendMessage', data);
    io.emit('receiveMessage', { message: data.message });
    res.status(200).json({ message: data.message });
});

app.post('/sapi/file-upload-status', (req, res) => {
    const data = req.body;
    console.log("=====File uploaded successfully========")
    io.emit('fileUploadStatus', data);
    res.status(200).json({ message: 'File upload status updated' });
});

// Start the server using PORT from environment variables
server.listen(NODE_JS_PORT, '0.0.0.0', () => {
    console.log(`Node.js server is running on port ${NODE_JS_PORT}`);
});
