const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SECRET_KEY = 'xxw09220706';

// Global role tags for checking if a user has the required role
const ROLES_REQUIRED = {
    ANY: ['regular', 'cashier', 'manager', 'superuser'], // No need to check
    REGULAR_OR_HIGHER: ['regular', 'cashier', 'manager', 'superuser'],
    CASHIER_OR_HIGHER: ['cashier', 'manager', 'superuser'],
    MANAGER_OR_HIGHER: ['manager', 'superuser'],
    SUPERUSER_ONLY: ['superuser']
};

// Authentication middleware
const jwtAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: "Authentication token not provided" });
    }
    
    jwt.verify(token, SECRET_KEY, async (err, data) => {
        if (err) {
            return res.status(401).json({ error: "Invalid authentication token" });
        }
        try {
            // Assuming the token payload includes the userId property
            const user = await prisma.user.findUnique({
                where: { id: data.userId }
            });
            if (!user) {
                return res.status(401).json({ error: "User not found" });
            }
            req.user = user;
            next();
        } catch (error) {
            console.error("Auth middleware error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    });
};

// Middleware to check if a user has the required role for a specific endpoint
// clearance: a predefined group from ROLES_REQUIRED or custom array of roles
// Prerequisites: jwtAuth must be called before this middleware
const checkRole = (clearance) => {
    // Convert to actual array of allowed roles for predefined group
    const allowedRoles = ROLES_REQUIRED[clearance] || clearance;
    
    return (req, res, next) => {
        // no need to check if any role is allowed
        if (clearance === 'ANY') {
            return next();
        }
        
        // if no authenticated user
        if (!req.user) {
            return res.status(401).json({ error: "Authentication required" });
        }

        // get user's role
        const userRole = req.user.role;
        
        // see if user's role is in the allowed roles
        const hasClearance = allowedRoles.includes(userRole);
                
        if (!hasClearance) {
            return res.status(403).json({ error: "Insufficient user clearance" });
        }

        next();
    };
};

module.exports = { jwtAuth, checkRole, ROLES: ROLES_REQUIRED };