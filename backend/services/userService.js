const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');
const { paginate } = require('../utils/paginationUtils');


/**
 * Register a new user
 * @param {Object} userData - validated user data
 * @returns {Promise<Object>} The created user object with resetToken and expiresAt
 */
async function createUser(userData) {
    // if user with the same utorid already exists
    const sameUtoridUser = await prisma.user.findFirst({
        where: { utorid: userData.utorid }
    });
    if (sameUtoridUser) {
        const error = new Error(`User with utorid '${userData.utorid}' already exists.`);
        error.statusCode = 409; // 409 Conflict if the user with that utorid already exists
        throw error;
    }

    // create a reset token that expires in 7 days
    const resetToken = uuidv4();
    const resetExpiresAt = new Date();
    resetExpiresAt.setDate(resetExpiresAt.getDate() + 7);

    // create user
    const newUser = await prisma.user.create({
        data: {
            utorid: userData.utorid,
            name: userData.name,
            email: userData.email,
            password: "",   // set when activating the account (using resetToken)
            resetToken,
            resetExpiresAt,
            role: 'regular',
            // verified and activated default to false
        }
    });

    // format response
    return {
        id: newUser.id,
        utorid: newUser.utorid,
        name: newUser.name,
        email: newUser.email,
        verified: newUser.verified,
        expiresAt: newUser.resetExpiresAt,
        resetToken: newUser.resetToken
    };
}

/**
 * Retrieve a list of users
 * @param {Object} req - request object
 * @param {Object} filters - name, role, verified, activated (all optional)
 * @returns {Promise<Object>} results with pagination
 */
async function filterUsers(req, filters = {}) {
    const { name, role, verified, activated } = filters;
    
    // build where filter
    const where = {};
    
    if (name) {
        where.OR = [
            { utorid: { contains: name } },
            { name: { contains: name } }
        ];
    }
    
    if (role !== undefined) where.role = role;
    if (verified !== undefined) where.verified = verified;
    if (activated !== undefined) where.activated = activated;

    const select = {
        id: true,
        utorid: true,
        name: true,
        email: true,
        birthday: true,
        role: true,
        points: true,
        createdAt: true,
        lastLogin: true,
        verified: true,
        avatarUrl: true
    };
    
    return paginate(req, where, 'user', { select });
}

/**
 * Retrieve a specific user
 * @param {number} userId 
 * @param {string} clearanceRole - Role of the user viewing this information
 * @returns {Promise<Object>} User data
 */
async function getUserById(userId, clearanceRole) {
    const where = { id: userId };
    const user = await prisma.user.findUnique({
        where,
    });
    
    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }
    
    // Filter available one-time promotions
    const availablePromotions = await getAvailablePromotions(user.id);
    
    // Format birthday as YYYY-MM-DD if it exists
    let formattedBirthday = null;
    if (user.birthday) {
        const date = new Date(user.birthday);
        formattedBirthday = date.toISOString().split('T')[0]; // Get YYYY-MM-DD part
    }
    
    // format response based on clearance role
    if (clearanceRole === 'cashier') {
        return {
            id: user.id,
            utorid: user.utorid,
            name: user.name,
            points: user.points,
            verified: user.verified,
            promotions: availablePromotions
        };
    }
    else if (clearanceRole === 'manager' || clearanceRole === 'superuser') {
        return {
            id: user.id,
            utorid: user.utorid,
            name: user.name,
            email: user.email,
            birthday: formattedBirthday,
            role: user.role,
            points: user.points,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            verified: user.verified,
            avatarUrl: user.avatarUrl,
            promotions: availablePromotions
        };
    }
}

/**
 * Helper function to get available one-time promotions for a user
 * @param {number} userId 
 * @returns {Promise<Array>} Array of available one-time promotions
 */
async function getAvailablePromotions(userId) {
    const now = new Date();
    
    const where = {
        type: 'one_time',
        startTime: { lte: now },    // has started
        endTime: { gte: now },      // has not ended
        oneTimeUsed: {              // has not been used by the user
            none: {
                id: userId
            }
        }
    };

    const select = {
        id: true,
        name: true,
        minSpending: true,
        rate: true,
        points: true
    };
    
    const promotions = await prisma.promotion.findMany({
        where,
        select
    });
    
    return promotions;
}

/**
 * Helper function to update user data
 * @param {number} userId - User ID
 * @param {Object} data - Data to update
 * @param {Object} returnFields - Fields to include in the response
 * @returns {Promise<Object>} Updated user data
 */
async function updateUser(userId, data, returnFields) {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });
    
    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }
    
    // update
    const where = { id: userId };
    const updatedUser = await prisma.user.update({
        where,
        data,
        select: returnFields
    });
    
    // Format birthday as YYYY-MM-DD if it exists in the response
    if (updatedUser.birthday) {
        const date = new Date(updatedUser.birthday);
        updatedUser.birthday = date.toISOString().split('T')[0]; // Get YYYY-MM-DD part
    }
    
    return updatedUser;
}

/**
 * Update a specific user's various statuses and some information
 * @param {number} userId - User ID
 * @param {Object} updateData - Data to update
 * @param {string} updaterRole - Role of the user making the update
 * @returns {Promise<Object>} Updated user data
 */
async function updateUserById(userId, updateData, updaterRole) {
    // create and validate data to be updated
    const data = {};
    const returnFields = { id: true, utorid: true, name: true };    // Response: only the field(s) that were updated will be returned
    
    // Role update based on updater's role
    if (updateData.role) {
        const newRole = updateData.role;
        
        // As Manager: Either "cashier" or "regular"
        // As Superuser: Any of "regular", "cashier", "manager", or "superuser"
        if (updaterRole === 'manager') {
            if (newRole !== 'cashier' && newRole !== 'regular') {
                const error = new Error('Managers can only set the role to cashier or regular');
                error.statusCode = 403;
                throw error;
            }
        }   // super user allows all role types. already validated in validationUtils in route.
        
        data.role = newRole;
        returnFields.role = true;
        
        // When promoting a user to a cashier, the initial value for suspicious should be false. 
        if (newRole === 'cashier') {
            data.suspicious = false;
            returnFields.suspicious = true; // TODO: include or not?
        }
    }
    
    // Response: only the field(s) that were updated will be returned
    if (updateData.email) {
        data.email = updateData.email;
        returnFields.email = true;
    }
    
    if (updateData.verified) {
        data.verified = true;   // Should always be set to true. Verified by validationUtils in route.
        returnFields.verified = true;
    }
    
    if (updateData.suspicious !== undefined) {
        data.suspicious = updateData.suspicious;
        returnFields.suspicious = true;
    }
    
    return updateUser(userId, data, returnFields);
}

/**
 * Update the current logged-in user's information
 * @param {number} userId - Current user's ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated user data
 */
async function updateMe(userId, updateData) {
    const data = {};
    
    // Handle birthday field
    if (updateData.birthday !== undefined) {
        if (updateData.birthday === null) {
            // Explicitly set to null if requested
            data.birthday = null;
        } else {
            // Convert string date to Date object for Prisma
            data.birthday = new Date(updateData.birthday);
        }
    }

    // Handle optional fields
    // For required fields like name, only include them if they're not null
    if (updateData.name !== undefined && updateData.name !== null) {
        data.name = updateData.name;
    }
    
    // Email is required in schema, don't set to null
    if (updateData.email !== undefined && updateData.email !== null) {
        data.email = updateData.email;
    }
    
    // Handle avatar field
    if (updateData.avatar !== undefined) {
        data.avatarUrl = updateData.avatar;
    }
    
    // Fixed return fields for /users/me endpoint
    const returnFields = {
        id: true,
        utorid: true,
        name: true,
        email: true,
        birthday: true,
        role: true,
        points: true,
        createdAt: true,
        lastLogin: true,
        verified: true,
        avatarUrl: true
    };
    
    return updateUser(userId, data, returnFields);
}

/**
 * Update current user's password
 * @param {number} userId - Current user's ID
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} Success status
 */
async function updatePassword(userId, oldPassword, newPassword) {
    const where = { id: userId };
    const user = await prisma.user.findUnique({
        where
    });
    
    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }
    
    // verify old password
    if (user.password !== oldPassword) {
        const error = new Error('Incorrect old password');
        error.statusCode = 403;
        throw error;
    }
    
    // validate new password
    const passwordFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    if (!passwordFormat.test(newPassword)) {
        const error = new Error('Password must be 8-20 characters, include at least one uppercase letter, one lowercase letter, one number, and one special character');
        error.statusCode = 400;
        throw error;
    }
    
    // update password using the common update function
    const data = { password: newPassword };
    // Use an object for the select parameter instead of a string
    const returnFields = { id: true };
    await updateUser(userId, data, returnFields);
    
    // Return a success message instead of the password data
    return { message: 'Password updated successfully' };
}

module.exports = {
    createUser,
    getUsers: filterUsers,
    getUserById,
    updateUserById,
    updateMe,
    updatePassword,
    getAvailablePromotions
};

