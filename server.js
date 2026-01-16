const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const databaseSchema = require('./schema');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Cache file path
const CACHE_FILE = path.join(__dirname, 'cache.json');

// Helper function to read cache
function readCache() {
    try {
        if (fs.existsSync(CACHE_FILE)) {
            const data = fs.readFileSync(CACHE_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading cache:', error);
    }
    return {};
}

// Helper function to write cache
function writeCache(cache) {
    try {
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing cache:', error);
    }
}

// Helper function to normalize query for cache key
function normalizeQuery(query) {
    return query.trim().toLowerCase();
}

// POST endpoint to generate SQL from natural language
app.post('/api/generate-sql', async (req, res) => {
    try {
        const { naturalLanguage } = req.body;

        // Validate input
        if (!naturalLanguage || typeof naturalLanguage !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid natural language query'
            });
        }

        if (naturalLanguage.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Query cannot be empty'
            });
        }

        if (naturalLanguage.length > 1000) {
            return res.status(400).json({
                success: false,
                error: 'Query is too long (max 1000 characters)'
            });
        }

        // Normalize query for cache lookup
        const cacheKey = normalizeQuery(naturalLanguage);
        const cache = readCache();

        // Check cache first
        if (cache[cacheKey]) {
            console.log('Cache hit for query:', naturalLanguage);
            return res.json({
                success: true,
                sql: cache[cacheKey],
                cached: true
            });
        }

        // Check if API key is configured
        if (!process.env.ANTHROPIC_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'API key not configured. Please set ANTHROPIC_API_KEY in .env file'
            });
        }

        // Build the system prompt with database schema
        const systemPrompt = `You are a SQL expert. Convert natural language queries into SQL statements.

Database Schema:
${databaseSchema}

Rules:
1. Generate standard SQL (compatible with PostgreSQL/MySQL)
2. Use appropriate JOINs when multiple tables are needed
3. Include clear column aliases for better readability
4. Add comments for complex queries
5. Return ONLY the SQL query, no explanations or markdown
6. If the query is ambiguous, make reasonable assumptions
7. Use best practices (prefer specific columns over SELECT *, use proper WHERE clauses)
8. For date-based queries, use appropriate date functions
9. Format the SQL with proper indentation for readability

Output format: Return only valid SQL code without any markdown formatting or code blocks.`;

        // Call Claude API
        const message = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1024,
            temperature: 0.2,
            system: systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: naturalLanguage
                }
            ]
        });

        // Extract SQL from response
        const sql = message.content[0].text.trim();

        // Save to cache
        cache[cacheKey] = sql;
        writeCache(cache);
        console.log('Cached new query:', naturalLanguage);

        // Return the generated SQL
        res.json({
            success: true,
            sql: sql,
            cached: false
        });

    } catch (error) {
        console.error('Error generating SQL:', error);

        // Handle specific error types
        if (error.status === 401) {
            return res.status(500).json({
                success: false,
                error: 'Invalid API key. Please check your ANTHROPIC_API_KEY in .env file'
            });
        }

        if (error.status === 429) {
            return res.status(429).json({
                success: false,
                error: 'Rate limit exceeded. Please try again in a moment'
            });
        }

        // Check if it's a network error (offline)
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.message?.includes('fetch')) {
            return res.status(503).json({
                success: false,
                error: 'No internet connection. This query is not in cache. Please connect to internet to generate new SQL queries.',
                offline: true
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to generate SQL. Please try again.'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API key configured: ${!!process.env.ANTHROPIC_API_KEY}`);
    if (!process.env.ANTHROPIC_API_KEY) {
        console.warn('WARNING: ANTHROPIC_API_KEY not found in environment variables');
        console.warn('Please create a .env file with your API key');
    }
});
