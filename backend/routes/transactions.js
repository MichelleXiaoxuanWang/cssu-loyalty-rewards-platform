const express = require('express');
const router = express.Router();
const transactionService = require('../services/transactionService');
const { validateRequest } = require('../utils/validationUtils');
const { jwtAuth, checkRole, ROLES } = require('../utils/authMiddleware');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// DEBUG: Case 78 Piazza @358 In your POST /transactions, you should return earned: 0. 
// In your GET /transactions/:transactionId, you should return amount: 60

// POST /transactions - Create a new purchase/adjustment transaction
// Clearance: Cashier or higher
router.post('/', jwtAuth, checkRole(ROLES.CASHIER_OR_HIGHER), async (req, res) => {
    try {
        // empty payload
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'Empty payload' });
        }
        // all null
        if (Object.values(req.body).every(value => value === null)) {
            return res.status(400).json({ error: 'All fields are null' });
        }

        // type must be purchase or adjustment
        if (req.body.type !== 'purchase' && req.body.type !== 'adjustment') {
            return res.status(400).json({ error: 'Invalid transaction type' });
        }

        // create purchase
        if (req.body.type === 'purchase') {
            // validate for purchase
            const schema = {
                utorid: { required: true, type: 'string' },
                type: { required: true, type: 'string', allowedValues: ['purchase'] },
                spent: { required: true, type: 'float', min: 0.0 },
                promotionIds: { type: 'array', itemType: 'integer' },
                remark: { type: 'string' }
            };
            
            try {
                const transactionData = validateRequest(req, schema);
                
                // Add current user as creator
                transactionData.createdBy = req.user.utorid;
                
                // Create purchase transaction
                const newTransaction = await transactionService.createPurchaseTransaction(transactionData);
                
                return res.status(201).json(newTransaction);
            } catch (validationError) {
                throw validationError;
            }
        }

        // create adjustment
        if (req.body.type === 'adjustment') {
            // Validate request body
            const schema = {
                utorid: { required: true, type: 'string' },
                type: { required: true, type: 'string', allowedValues: ['adjustment'] },
                amount: { required: true, type: 'integer' },
                relatedId: { required: true, type: 'integer' },
                promotionIds: { type: 'array', itemType: 'integer' },
                remark: { type: 'string' }
            };
            
            try {
                const transactionData = validateRequest(req, schema);
                
                // Add current user as creator
                transactionData.createdBy = req.user.utorid;
                
                // Create adjustment transaction
                const newTransaction = await transactionService.createAdjustmentTransaction(transactionData);
                
                return res.status(201).json(newTransaction);
            } catch (validationError) {
                throw validationError;
            }
        }
        
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error creating transaction:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /transactions - Retrieve a list of transactions
// Clearance: Manager or higher
router.get('/', jwtAuth, checkRole(ROLES.MANAGER_OR_HIGHER), async (req, res) => {
    try {
        // Parse query parameters
        const filters = {};
        
        // String filters
        if (req.query.name) filters.name = req.query.name;
        if (req.query.createdBy) filters.createdBy = req.query.createdBy;
        if (req.query.type) filters.type = req.query.type;
        
        // Numeric filters
        if (req.query.promotionId) filters.promotionId = parseInt(req.query.promotionId, 10);
        if (req.query.relatedId) filters.relatedId = parseInt(req.query.relatedId, 10);
        if (req.query.amount !== undefined) filters.amount = parseInt(req.query.amount, 10);
        
        // Boolean filters
        if (req.query.suspicious !== undefined) {
            filters.suspicious = req.query.suspicious === 'true';
        }
        
        // Special filters
        if (req.query.operator) {
            filters.operator = req.query.operator;
        }
        
        // Pagination
        if (req.query.page) {
            const page = parseInt(req.query.page, 10);
            if (isNaN(page) || page < 1) {
                return res.status(400).json({ error: 'Invalid page parameter' });
            }
            filters.page = page;
        }
        
        if (req.query.limit) {
            const limit = parseInt(req.query.limit, 10);
            if (isNaN(limit) || limit < 1) {
                return res.status(400).json({ error: 'Invalid limit parameter' });
            }
            filters.limit = limit;
        }
        
        // Get transactions
        const transactions = await transactionService.getTransactions(filters);
        
        return res.json(transactions);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error retrieving transactions:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /transactions/:transactionId - Retrieve a single transaction
// Clearance: Manager or higher
router.get('/:transactionId', jwtAuth, checkRole(ROLES.MANAGER_OR_HIGHER), async (req, res) => {
    try {
        // Parse transaction ID
        const transactionId = parseInt(req.params.transactionId, 10);
        
        if (isNaN(transactionId)) {
            return res.status(400).json({ error: 'Invalid transaction ID' });
        }
        
        // Get transaction
        const transaction = await transactionService.getTransactionById(transactionId);
        
        return res.json(transaction);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error retrieving transaction:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// PATCH /transactions/:transactionId/suspicious - Set or unset a transaction as being suspicious
// Clearance: Manager or higher
router.patch('/:transactionId/suspicious', jwtAuth, checkRole(ROLES.MANAGER_OR_HIGHER), async (req, res) => {
    try {
        // Parse transaction ID
        const transactionId = parseInt(req.params.transactionId, 10);
        if (isNaN(transactionId)) {
            return res.status(400).json({ error: 'Invalid transaction ID' });
        }
        
        // Validate request body
        const schema = {
            suspicious: { required: true, type: 'boolean' }
        };
        
        const updateData = validateRequest(req, schema);
        
        // Update suspicious status
        const updatedTransaction = await transactionService.updateSuspiciousStatus(
            transactionId, 
            updateData.suspicious
        );
        
        return res.json(updatedTransaction);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error updating suspicious status:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// PATCH /transactions/:transactionId/processed - Set a redemption transaction as being completed
// Clearance: Cashier or higher
router.patch('/:transactionId/processed', jwtAuth, checkRole(ROLES.CASHIER_OR_HIGHER), async (req, res) => {
    try {
        // Parse transaction ID
        const transactionId = parseInt(req.params.transactionId, 10);
        
        if (isNaN(transactionId)) {
            return res.status(400).json({ error: 'Invalid transaction ID' });
        }
        
        // Validate request body
        const schema = {
            processed: { required: true, type: 'boolean' }
        };
        
        try {
            const updateData = validateRequest(req, schema);
            
            // Can only set to true
            if (!updateData.processed) {
                return res.status(400).json({ error: 'processed can only be set to true' });
            }
            
            // Process the redemption
            const updatedTransaction = await transactionService.processRedemptionTransaction(
                transactionId, 
                req.user.utorid
            );
            
            return res.json(updatedTransaction);
        } catch (validationError) {
            throw validationError;
        }
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error processing redemption transaction:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
