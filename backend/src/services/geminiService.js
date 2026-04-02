const axios = require('axios');
const geminiConfig = require('../config/gemini');

let currentKeyIndex = 0;

const generateContent = async (prompt) => {
    const keys = geminiConfig.apiKeys;
    const model = geminiConfig.model;
    const attempts = keys.length;

    for (let i = 0; i < attempts; i++) {
        const index = (currentKeyIndex + i) % keys.length;
        const key = keys[index].trim();
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

        try {
            const requestBody = {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            };

            console.log(`Calling Gemini API with key index: ${index}`);
            const response = await axios.post(url, requestBody, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Update the current key index to the successful one 
            currentKeyIndex = index;
            return response.data;

        } catch (error) {
            console.error(`Error calling Gemini API with key index ${index}: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
            // If it's a rate limit or other error, try next key
        }
    }

    throw new Error('All Gemini API keys failed after ' + attempts + ' attempts.');
};

module.exports = { generateContent };
