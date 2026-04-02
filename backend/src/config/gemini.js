module.exports = {
    apiKeys: process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',') : [],
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
};
