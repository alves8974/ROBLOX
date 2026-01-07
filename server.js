require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Comprehensive CORS Support
app.use(cors({ origin: '*' }));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 2. Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Proxy for User ID Lookup
app.post('/api/user', async (req, res) => {
    try {
        const { usernames, excludeBannedUsers } = req.body;
        console.log(`Processing user lookup for: ${usernames}`);

        const response = await axios.post('https://users.roblox.com/v1/usernames/users', {
            usernames,
            excludeBannedUsers
        });

        console.log(`User lookup success: ${JSON.stringify(response.data)}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching user:', error.message);
        if (error.response) console.error('API Response:', error.response.data);

        res.status(500).json({
            error: 'Failed to fetch user',
            details: error.message
        });
    }
});

// Proxy for Avatar Lookup
app.get('/api/avatar', async (req, res) => {
    try {
        const { userIds, size, format, isCircular } = req.query;
        // Verify explicit https usage
        const apiUrl = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userIds}&size=${size}&format=${format}&isCircular=${isCircular}`;

        console.log(`Fetching avatar from: ${apiUrl}`);

        const response = await axios.get(apiUrl);
        console.log('Avatar fetch success');
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching avatar:', error.message);
        if (error.response) console.error('API Response:', error.response.data);

        res.status(500).json({
            error: 'Failed to fetch avatar',
            details: error.message
        });
    }
});

// Simulate Offers Check
app.get('/public/external/check2.php', (req, res) => {
    console.log('Checking offers...');
    // Simulate empty result or occasional success for testing
    res.json([]);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
