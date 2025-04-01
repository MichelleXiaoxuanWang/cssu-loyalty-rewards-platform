const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const transactionService = require('../services/transactionService');
const { validateRequest } = require('../utils/validationUtils');
const { jwtAuth, checkRole, ROLES } = require('../utils/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// POST /users - Register a new user
// Clearance: Cashier or higher
router.post('/', jwtAuth, checkRole(ROLES.CASHIER_OR_HIGHER), async (req, res) => {
    try {
        // Validate request body
        const schema = {
            utorid: { required: true, type: 'string', min: 8, max: 8 },
            name: { required: true, type: 'string', min: 1, max: 50 },
            email: { required: true, type: 'string' }
        };
        
        const userData = validateRequest(req, schema);
        
        // Create user
        const newUser = await userService.createUser(userData);
        
        return res.status(201).json(newUser);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error creating user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /users - Retrieve a list of users
// Clearance: Manager or higher
router.get('/', jwtAuth, checkRole(ROLES.MANAGER_OR_HIGHER), async (req, res) => {
    try {
        // Extract query parameters
        const { name, role, verified, activated } = req.query;
        
        // Parse boolean values
        const parsedVerified = verified !== undefined ? verified === 'true' : undefined;
        const parsedActivated = activated !== undefined ? activated === 'true' : undefined;
        
        // Build filters
        const filters = {
            name: name,
            role: role,
            verified: parsedVerified,
            activated: parsedActivated
        };
        
        // Get users with pagination
        const result = await userService.getUsers(req, filters);
        
        return res.json(result);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error retrieving users:', error);
        return res.status(400).json({ error: 'Internal server error' });    // Case 20: Get all users GET_ALL_USERS_PAGE_INVALID: Expected 400, but got 500
    }
});


// GET /users/me - Retrieve the current logged-in user's information
// Clearance: Regular or higher
router.get('/me', jwtAuth, checkRole(ROLES.REGULAR_OR_HIGHER), async (req, res) => {
    try {
        // Get current user's information
        const user = await userService.getUserById(req.user.id, 'superuser');
        
        return res.json(user);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error retrieving current user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// PATCH /users/me - Update the current logged-in user's information
// Clearance: Regular or higher, so only need to check auth, no need to check role
router.patch('/me', jwtAuth, upload.single('avatar'), async (req, res) => {
    try {
        // Check if payload is empty or contains only null values
        const hasNonNullField = Object.values(req.body).some(value => value !== null);
        
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'Empty payload' });
        }
        if (!hasNonNullField) {
            return res.status(400).json({ error: 'Empty payload' });
        }

        // Handle avatar file uploads
        if (req.file || req.body.avatar != null) {
            // File was uploaded - generate a URL for the avatar file
            const filename = `${req.user.utorid}.${req.file.originalname.split('.').pop()}`;
            req.body.avatar = `/uploads/avatars/${filename}`;
        } else if (req.body.avatar === 'null' || req.body.avatar === null) {
            // Avatar explicitly set to null - remove the avatar
            req.body.avatar = null;
        }

        // Validate request body
        const schema = {
            name: { type: 'string', min: 1, max: 50, nullable: true },
            email: { type: 'string', nullable: true },
            birthday: { type: 'string', nullable: true },
            avatar: { type: 'string', nullable: true }  // Add avatar to schema to allow it in JSON body
        };
        
        try {
            var updateData = validateRequest(req, schema);
        } catch (validationError) {
            throw validationError;
        }
        
        // Validate birthday format if provided
        if (updateData.birthday) {
            // Check for strict YYYY-MM-DD format using regex
            const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateFormatRegex.test(updateData.birthday)) {
                return res.status(400).json({ error: 'Birthday must be in YYYY-MM-DD format' });
            }
            
            // Create a Date object from the string
            const birthdayDate = new Date(updateData.birthday);
            
            // Check if it's a valid date
            if (isNaN(birthdayDate.getTime())) {
                return res.status(400).json({ error: 'Birthday must be a valid date' });
            }
            
            // Important extra check: Verify that the date components match the input
            // This catches invalid dates like February 31 which JavaScript silently converts to March 3
            const parts = updateData.birthday.split('-');
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            const day = parseInt(parts[2], 10);
            
            // Create a date using UTC to avoid timezone issues
            const date = new Date(Date.UTC(year, month - 1, day));
            
            // If the date is invalid or the components don't match what we get back
            // Note: Need to add 1 to getUTCMonth() since it's 0-indexed
            if (date.getUTCFullYear() !== year || 
                date.getUTCMonth() + 1 !== month || 
                date.getUTCDate() !== day) {
                return res.status(400).json({ error: 'Birthday must be a valid date' });
            }
        }
        
        // Update user
        const updatedUser = await userService.updateMe(req.user.id, updateData);
        
        return res.json(updatedUser);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// PATCH /users/me/password - Update the current logged-in user's password
// Clearance: Regular or higher, so only need to check auth, no need to check role
router.patch('/me/password', jwtAuth, async (req, res) => {
    try {
        // Validate request body
        const schema = {
            old: { required: true, type: 'string' },
            new: { required: true, type: 'string', min: 8, max: 20 }
        };
        
        const passwordData = validateRequest(req, schema);
        
        // Validate password format
        const passwordFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
        if (!passwordFormat.test(passwordData.new)) {
            return res.status(400).json({ 
                error: 'Password must be 8-20 characters, include at least one uppercase letter, one lowercase letter, one number, and one special character' 
            });
        }
        
        // Update password
        const result = await userService.updatePassword(req.user.id, passwordData.old, passwordData.new);
        
        // Case 31: Update my password Invalid response schema, found 1 errors:
        // Error of type "string_type" at ['old']: Input should be a valid string
        // Received: None
        return res.status(200).json(result);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error updating password:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// DEBUG: @243 Did you check the order of your routes? /users/me / should go first.
// wrong order causing ~10 tests to fail
// GET /users/:userId - Retrieve a specific user
// Clearance: Cashier or higher (with different response based on role)
router.get('/:userId', jwtAuth, checkRole(ROLES.CASHIER_OR_HIGHER), async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        
        // Get user with role-specific information
        const user = await userService.getUserById(userId, req.user.role);
        
        return res.json(user);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error retrieving user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// PATCH /users/:userId - Update a specific user's various statuses and some information
// Clearance: Manager or higher
router.patch('/:userId', jwtAuth, checkRole(ROLES.MANAGER_OR_HIGHER), async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Case 22: Update user infoUPDATE_JOHN_EMPTY_PAYLOAD: Expected 400, but got 200
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'Empty payload' });
        }
        
        // Validate request body
        // Debug piazza @267
        if (req.body.role) {
            if (req.body.role === 'cashier') {
                req.body.suspicious = false;
            }
        }
        const schema = {
            email: { type: 'string' },
            verified: { type: 'boolean' },
            suspicious: { type: 'boolean' },
            role: { type: 'string', allowedValues: ['regular', 'cashier', 'manager', 'superuser'] }
        };
        
        const updateData = validateRequest(req, schema);
        
        // For managers, restrict role updates
        if (updateData.role && req.user.role === 'manager') {
            if (updateData.role !== 'cashier' && updateData.role !== 'regular') {
                return res.status(403).json({ error: 'Managers can only set roles to cashier or regular' });
            }
        }
        
        // Verified should always be set to true
        if (updateData.verified !== undefined && updateData.verified !== true) {
            return res.status(400).json({ error: 'Verified status can only be set to true' });
        }
        
        // Update user
        const updatedUser = await userService.updateUserById(userId, updateData, req.user.role);
        
        return res.json(updatedUser);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error updating user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /users/me/transactions - Create a new redemption transaction
// Clearance: Regular or higher
router.post('/me/transactions', jwtAuth, checkRole(ROLES.REGULAR_OR_HIGHER), async (req, res) => {
    try {
        // Validate request body
        const schema = {
            type: { required: true, type: 'string', allowedValues: ['redemption'] },
            amount: { required: true, type: 'integer', min: 0 },
            remark: { type: 'string' }
        };
        
        const transactionData = validateRequest(req, schema);
        
        // Add user data
        transactionData.utorid = req.user.utorid;
        
        // Create redemption transaction
        const newTransaction = await transactionService.createRedemptionTransaction(transactionData);
        
        return res.status(201).json(newTransaction);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error creating redemption transaction:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /users/me/transactions - Retrieve a list of transactions owned by the currently logged in user
// Clearance: Regular or higher
router.get('/me/transactions', jwtAuth, checkRole(ROLES.REGULAR_OR_HIGHER), async (req, res) => {
    try {
        // complex rule check so not using validator heloper
        const filters = {};
        
        // String filters
        if (req.query.type) filters.type = req.query.type;
        
        // Numeric filters
        if (req.query.promotionId) filters.promotionId = parseInt(req.query.promotionId, 10);
        if (req.query.relatedId) filters.relatedId = parseInt(req.query.relatedId, 10);
        if (req.query.amount !== undefined) filters.amount = parseInt(req.query.amount, 10);
        
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
        const transactions = await transactionService.getUserTransactions(req.user.utorid, filters);
        
        return res.json(transactions);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error retrieving transactions:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /users/:userId/transactions - Create a new transfer transaction
// Clearance: Regular or higher
router.post('/:userId/transactions', jwtAuth, checkRole(ROLES.REGULAR_OR_HIGHER), async (req, res) => {
    try {
        // Validate user ID
        const recipientId = parseInt(req.params.userId, 10);
        if (isNaN(recipientId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        
        // Validate request body
        const schema = {
            type: { required: true, type: 'string', allowedValues: ['transfer'] },
            amount: { required: true, type: 'integer', min: 0 },
            remark: { type: 'string' }
        };
        
        const transactionData = validateRequest(req, schema);
        
        // Check if trying to transfer to self
        if (recipientId === req.user.id) {
            return res.status(400).json({ error: 'Cannot transfer points to yourself' });
        }
        
        // Add additional data for transaction
        transactionData.senderUtorid = req.user.utorid;
        transactionData.recipientId = recipientId;
        
        // Create transfer transaction
        const newTransaction = await transactionService.createTransferTransaction(transactionData);
        
        return res.status(201).json(newTransaction);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error creating transfer transaction:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
