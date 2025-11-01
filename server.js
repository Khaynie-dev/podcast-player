import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import CryptoJS from 'crypto-js';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url'; // Import to derive __dirname

dotenv.config();

// Derive __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const authKey = process.env.AUTH_KEY;
const secretKey = process.env.SECRET_KEY;
const userAgent = process.env.USER_AGENT;
const apiEndpoint = process.env.API_ENDPOINT;

app.use(express.static(path.join(__dirname, 'public')));

// Shared authentication function
function generateAuthHeaders() {
    const apiHeaderTime = Math.floor(Date.now() / 1000);
    const hash = CryptoJS.SHA1(authKey + secretKey + apiHeaderTime).toString(CryptoJS.enc.Hex);

    return {
        'User-Agent': userAgent,
        'X-Auth-Key': authKey,
        'X-Auth-Date': apiHeaderTime.toString(),
        'Authorization': hash
    };
}

// Search for podcasts
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: "Query Parameter is required" });
    }

    const headers = generateAuthHeaders();
    
    try {
        const response = await fetch(`${apiEndpoint}?q=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: headers
        });

        if (response.ok && response.headers.get('content-type').includes('application/json')) {
            const data = await response.json();
            console.log('Raw Response:', rawText);
            res.status(500).json({ error: 'Invalid response from API', rawText })
        }

    } catch (error) {
        console.error('Error fetching API:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT} pointing to ${apiEndpoint}`);
});