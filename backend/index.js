#!/usr/bin/env node
'use strict';

// Load environment variables
require('dotenv').config();

const port = (() => {
    const args = process.argv;

    if (args.length !== 3) {
        // Use environment variable as fallback
        return process.env.PORT || 8000;
    }

    const num = parseInt(args[2], 10);
    if (isNaN(num)) {
        console.error("error: argument must be an integer.");
        process.exit(1);
    }

    return num;
})();

const express = require("express");
const app = express();

app.use(express.json());

// ADD YOUR WORK HERE
const cors = require('cors');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const promotionRoutes = require('./routes/promotions');
const transactionRoutes = require('./routes/transactions');

// CORS for all routes
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5175',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// static files from uploads directory
app.use('/uploads', express.static('uploads'));

// routes
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/promotions', promotionRoutes);
app.use('/transactions', transactionRoutes);

// All MY CODE GO ABOVE

const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

server.on('error', (err) => {
    console.error(`cannot start server: ${err.message}`);
    process.exit(1);
});