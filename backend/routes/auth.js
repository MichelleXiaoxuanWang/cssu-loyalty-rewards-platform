const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { validateRequest } = require('../utils/validationUtils');

/**
 * POST /auth/tokens - Authenticate a user and generate a JWT token
 * Clearance: Any
 */
router.post('/tokens', async (req, res) => {
    try {
        // Validate request body
        const schema = {
            utorid: { required: true, type: 'string' },
            password: { required: true, type: 'string' }
        };
        
        const credentials = validateRequest(req, schema);
        
        // Login and get token
        const result = await authService.login(credentials.utorid, credentials.password);
        
        return res.json(result);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error during authentication:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /auth/resets - Request a password reset email
 * Clearance: Any
 */
router.post('/resets', async (req, res) => {
    try {
        // Validate request body
        const schema = {
            utorid: { required: true, type: 'string' }
        };
        
        const resetData = validateRequest(req, schema);
        
        // Get client IP for rate limiting
        const clientIp = req.ip || req.connection.remoteAddress;
        
        // Request password reset
        const result = await authService.requestPasswordResetToken(resetData.utorid, clientIp);
        
        // Return 202 Accepted (request has been accepted for processing)
        return res.status(202).json(result);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error requesting password reset:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /auth/resets/:resetToken - Reset the password of a user given a reset token
 * Clearance: Any
 */
router.post('/resets/:resetToken', async (req, res) => {
    try {
        // Get reset token from URL
        
        const resetToken = req.params.resetToken;
        if (!resetToken) {
            return res.status(404).json({ error: 'Reset token does not exist' });
        }
        
        // Validate request body
        const schema = {
            utorid: { required: true, type: 'string' },
            password: { required: true, type: 'string' }
        };
        
        const resetData = validateRequest(req, schema);
        
        // Reset password
        await authService.resetPassword(resetToken, resetData.utorid, resetData.password);
        
        return res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error resetting password:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
