// E-commerce Database Schema
// This schema is provided to Claude API as context for generating SQL queries

const databaseSchema = `
-- E-commerce Database Schema

-- Users table: Stores customer information
CREATE TABLE users (
    user_id INT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Products table: Stores product catalog
CREATE TABLE products (
    product_id INT PRIMARY KEY,
    product_name VARCHAR(200) NOT NULL,
    category VARCHAR(50),
    price DECIMAL(10, 2),
    stock_quantity INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table: Stores customer orders
CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    user_id INT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2),
    status VARCHAR(20), -- 'pending', 'completed', 'cancelled'
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Order_items table: Stores individual items in each order
CREATE TABLE order_items (
    order_item_id INT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT,
    price_at_purchase DECIMAL(10, 2),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Relationships:
-- - One user can have many orders (users.user_id -> orders.user_id)
-- - One order can have many order items (orders.order_id -> order_items.order_id)
-- - One product can appear in many order items (products.product_id -> order_items.product_id)
`;

module.exports = databaseSchema;
