# Natural Language to SQL Translator
[切换到中文版](CaseStudy.md)

A web application that translates natural language queries into SQL statements using Claude AI. Simply type what you want to query in plain English, and get the corresponding SQL code instantly.

## Features

- **Natural Language Processing**: Convert plain English queries to SQL using Claude AI
- **Interactive Web Interface**: Clean, modern UI with real-time SQL generation
- **Database Schema Context**: Provides an e-commerce database schema for accurate SQL generation
- **Example Queries**: Pre-built examples to get you started quickly
- **Copy to Clipboard**: One-click copying of generated SQL
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)
- **Claude API Key** from Anthropic

## Getting Your Claude API Key

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key (you'll need it for setup)

## Installation

1. **Clone or download this project**

   ```bash
   cd NaturalLanguagetoSQL
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:

   ```bash
   cp .env.example .env
   ```

   Open the `.env` file and add your Claude API key:

   ```
   ANTHROPIC_API_KEY=your_actual_api_key_here
   ```

## Usage

1. **Start the server**

   ```bash
   npm start
   ```

2. **Open your browser**

   Navigate to: `http://localhost:3000`

3. **Use the application**

   - Enter your query in plain English in the text area
   - Click "Generate SQL" or press Ctrl/Cmd + Enter
   - View the generated SQL code
   - Click "Copy to Clipboard" to copy the SQL

## Example Queries

Try these example queries to see the application in action:

- "Show all users who registered in the last 30 days"
- "List the top 10 products by total revenue"
- "Find orders with total amount greater than $500"
- "Show customers who haven't ordered in the last 6 months"
- "Get the average order value by month for the current year"
- "List products with stock quantity below 10"
- "Show the most popular product categories by number of orders"

## Database Schema

The application uses an e-commerce database schema with the following tables:

### users
- `user_id` (INT, Primary Key)
- `username` (VARCHAR)
- `email` (VARCHAR)
- `created_at` (TIMESTAMP)
- `last_login` (TIMESTAMP)

### products
- `product_id` (INT, Primary Key)
- `product_name` (VARCHAR)
- `category` (VARCHAR)
- `price` (DECIMAL)
- `stock_quantity` (INT)
- `created_at` (TIMESTAMP)

### orders
- `order_id` (INT, Primary Key)
- `user_id` (INT, Foreign Key)
- `order_date` (TIMESTAMP)
- `total_amount` (DECIMAL)
- `status` (VARCHAR)

### order_items
- `order_item_id` (INT, Primary Key)
- `order_id` (INT, Foreign Key)
- `product_id` (INT, Foreign Key)
- `quantity` (INT)
- `price_at_purchase` (DECIMAL)

## Project Structure

```
NaturalLanguagetoSQL/
├── package.json          # Node.js dependencies and scripts
├── .gitignore           # Git ignore file
├── .env.example         # Environment variable template
├── .env                 # Your actual API key (not committed)
├── README.md            # This file
├── server.js            # Express backend server
├── schema.js            # Database schema definition
└── public/              # Frontend files
    ├── index.html       # Main HTML file
    ├── styles.css       # CSS styling
    └── app.js           # Client-side JavaScript
```

## Technology Stack

### Backend
- **Express.js**: Web server framework
- **@anthropic-ai/sdk**: Official Claude API client
- **dotenv**: Environment variable management

### Frontend
- **Vanilla JavaScript**: No framework dependencies
- **Modern CSS**: Responsive design with Flexbox/Grid
- **Fetch API**: For backend communication

## Troubleshooting

### "API key not configured" error

**Solution**: Make sure you've created a `.env` file with your Claude API key:

```
ANTHROPIC_API_KEY=your_actual_api_key_here
```

Restart the server after adding the API key.

### "Network error" message

**Solution**:
- Check that the server is running on port 3000
- Verify your internet connection
- Check if another application is using port 3000

To use a different port:
```bash
PORT=8080 npm start
```

### "Rate limit exceeded" error

**Solution**:
- Wait a moment before making another request
- Check your Claude API usage limits at Anthropic Console

### Server won't start

**Solution**:
- Ensure Node.js is installed: `node --version`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check for port conflicts: `lsof -i :3000` (on Mac/Linux)

## API Endpoints

### POST `/api/generate-sql`

Generate SQL from natural language.

**Request Body:**
```json
{
  "naturalLanguage": "Show all users who registered in the last 30 days"
}
```

**Response:**
```json
{
  "success": true,
  "sql": "SELECT * FROM users WHERE created_at >= NOW() - INTERVAL 30 DAY;"
}
```

### GET `/api/health`

Check server and API key status.

**Response:**
```json
{
  "status": "ok",
  "apiKeyConfigured": true
}
```

## Security Considerations

- **API Key Protection**: The API key is stored server-side in `.env` and never exposed to the client
- **Input Validation**: All user inputs are validated on the backend
- **HTTPS Recommended**: Use HTTPS in production environments
- **Rate Limiting**: Consider adding rate limiting for production use

## Customization

### Changing the Database Schema

Edit `schema.js` to use your own database schema:

```javascript
const databaseSchema = `
-- Your custom schema here
CREATE TABLE your_table (
    id INT PRIMARY KEY,
    ...
);
`;

module.exports = databaseSchema;
```

### Adjusting Claude API Parameters

In `server.js`, you can modify the Claude API call:

```javascript
const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',  // Change model
    max_tokens: 1024,                     // Adjust token limit
    temperature: 0.2,                     // Adjust creativity (0-1)
    // ...
});
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

ISC

## Acknowledgments

- Built with [Claude AI](https://www.anthropic.com/claude) by Anthropic
- UI design inspired by modern web applications
- Example queries based on common e-commerce analytics needs

## Support

For issues related to:
- **Claude API**: Visit [Anthropic Documentation](https://docs.anthropic.com/)
- **This Application**: Create an issue in the repository

---

Built with Express.js and Claude API
