const express = require('express');
const router = express.Router();
const promotionService = require('../services/promotionService');
const { validateRequest } = require('../utils/validationUtils');
const { jwtAuth, checkRole, ROLES } = require('../utils/authMiddleware');

// POST /promotions - Create a new promotion
// Clearance: Manager or higher
router.post('/', jwtAuth, checkRole(ROLES.MANAGER_OR_HIGHER), async (req, res) => {
    try {
        // empty payload
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'Empty payload' });
        }
        // all null
        if (Object.values(req.body).every(value => value === null)) {
            return res.status(400).json({ error: 'All fields are null' });
        }

        // Validate request body
        const schema = {
            name: { required: true, type: 'string' },
            description: { required: true, type: 'string' },
            type: { required: true, type: 'string', allowedValues: ['automatic', 'one-time'] },
            startTime: { required: true, type: 'string' },
            endTime: { required: true, type: 'string' },
            minSpending: { type: 'float', min: 0, nullable: true }, // validator ensures > min for float
            rate: { type: 'float', min: 0, nullable: true }, 
            points: { type: 'integer', min: 0, nullable: true }
        };
        
        try {
            const promotionData = validateRequest(req, schema);
            
            // Create promotion
            const newPromotion = await promotionService.createPromotion(promotionData);
            
            return res.status(201).json(newPromotion);
        } catch (validationError) {
            throw validationError;
        }
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error creating promotion:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /promotions - Retrieve a list of promotions
// Clearance: Regular or higher
router.get('/', jwtAuth, async (req, res) => {
    try {
        // not using validator because needs to handle different logic for different roles
        const filters = {
            name: req.query.name,
            type: req.query.type,
            page: req.query.page ? parseInt(req.query.page, 10) : undefined,
            limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined
        };
        
        // For managers, add started/ended filters
        const isManager = ['manager', 'superuser'].includes(req.user.role);
        if (isManager) {
            if (req.query.started !== undefined) {
                filters.started = req.query.started === 'true';
            }
            
            if (req.query.ended !== undefined) {
                filters.ended = req.query.ended === 'true';
            }
            
            // Check for both started and ended filters (not allowed)
            if (filters.started !== undefined && filters.ended !== undefined) {
                return res.status(400).json({ error: 'Cannot specify both started and ended filters' });
            }
        }
        
        // Remove undefined values
        Object.keys(filters).forEach(key => {
            if (filters[key] === undefined) {
                delete filters[key];
            }
        });
        
        // Add user info for permissions check
        const userInfo = {
            userId: req.user.id,
            userRole: req.user.role
        };
        
        // Get promotions
        const promotions = await promotionService.getPromotions(filters, userInfo);
        
        return res.json(promotions);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error retrieving promotions:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /promotions/:promotionId - Retrieve a single promotion
// Clearance: Regular or higher
router.get('/:promotionId', jwtAuth, async (req, res) => {
    try {
        // validate id
        const promotionId = parseInt(req.params.promotionId, 10);
        if (isNaN(promotionId)) {
            return res.status(400).json({ error: 'Invalid promotion ID' });
        }
        
        // user info for clearance check
        const userInfo = {
            userId: req.user.id,
            userRole: req.user.role
        };
        
        // get promotion through service
        const promotion = await promotionService.getPromotionById(promotionId, userInfo);
        
        return res.json(promotion);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error retrieving promotion:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// PATCH /promotions/:promotionId - Update an existing promotion
// Clearance: Manager or higher
router.patch('/:promotionId', jwtAuth, checkRole(ROLES.MANAGER_OR_HIGHER), async (req, res) => {
    try {
        // validate id
        const promotionId = parseInt(req.params.promotionId, 10);
        if (isNaN(promotionId)) {
            return res.status(400).json({ error: 'Invalid promotion ID' });
        }
        
        // empty payload
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'Empty payload' });
        }
        // all null
        if (Object.values(req.body).every(value => value === null)) {
            return res.status(400).json({ error: 'All fields are null' });
        }
        
        // validate request body
        const schema = {
            name: { type: 'string', nullable: true },
            description: { type: 'string', nullable: true },
            type: { type: 'string', allowedValues: ['automatic', 'one-time'], nullable: true },
            startTime: { type: 'string', nullable: true },
            endTime: { type: 'string', nullable: true },
            minSpending: { type: 'float', min: 0, nullable: true },
            rate: { type: 'float', min: 0, nullable: true },
            points: { type: 'integer', min: 0, nullable: true }
        };
        
        try {
            const updateData = validateRequest(req, schema);
            
            // Update promotion
            const updatedPromotion = await promotionService.updatePromotion(promotionId, updateData);
            
            return res.json(updatedPromotion);
        } catch (validationError) {
            throw validationError;
        }
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error updating promotion:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /promotions/:promotionId - Remove the specified promotion
// Clearance: Manager or higher
router.delete('/:promotionId', jwtAuth, checkRole(ROLES.MANAGER_OR_HIGHER), async (req, res) => {
    try {
        // validate id
        const promotionId = parseInt(req.params.promotionId, 10);
        if (isNaN(promotionId)) {
            return res.status(400).json({ error: 'Invalid promotion ID' });
        }
        
        // Delete promotion
        await promotionService.deletePromotion(promotionId);
        
        return res.status(204).send();
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error deleting promotion:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
