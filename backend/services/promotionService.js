const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Create a new promotion
 * @param {Object} promotionData - The promotion data
 * @returns {Promise<Object>} The created promotion
 */
async function createPromotion(promotionData) {
    try {
        // Parse dates
        const startTime = new Date(promotionData.startTime);
        const endTime = new Date(promotionData.endTime);
        const now = new Date();
    
        // Validate dates
        if (isNaN(startTime.getTime())) {
            const error = new Error('Invalid start time format. Must be ISO 8601 format');
            error.statusCode = 400;
            throw error;
        }
        if (isNaN(endTime.getTime())) {
            const error = new Error('Invalid end time format. Must be ISO 8601 format');
            error.statusCode = 400;
            throw error;
        }
        if (startTime < now) {
            const error = new Error('Start time must not be in the past');
            error.statusCode = 400;
            throw error;
        }
        if (endTime <= startTime) {
            const error = new Error('End time must be after start time');
            error.statusCode = 400;
            throw error;
        }

        // Create the promotion
        const newPromotion = await prisma.promotion.create({
            data: {
                name: promotionData.name,
                description: promotionData.description,
                type: promotionData.type === 'automatic' ? 'automatic' : 'one_time',
                startTime,
                endTime,
                ...(promotionData.minSpending !== undefined && promotionData.minSpending !== null && { minSpending: promotionData.minSpending }),
                ...(promotionData.rate !== undefined && promotionData.rate !== null && { rate: promotionData.rate }),
                ...(promotionData.points !== undefined && promotionData.points !== null && { points: promotionData.points })
            }
        });

        // Format the response
        const response = {
            id: newPromotion.id,
            name: newPromotion.name,
            description: newPromotion.description,
            type: newPromotion.type === 'one_time' ? 'one-time' : newPromotion.type,
            startTime: newPromotion.startTime.toISOString(),
            endTime: newPromotion.endTime.toISOString(),
            minSpending: newPromotion.minSpending,
            rate: newPromotion.rate,
            points: newPromotion.points
        };
        
        return response;
    } catch (error) {
        if (!error.statusCode) {
            console.error('Database error creating promotion:', error);
            error.statusCode = 500;
            error.message = 'Error creating promotion in database';
        }
        throw error;
    }
}

/**
 * Get promotions with optional filters and pagination
 * @param {Object} filters - Filter criteria
 * @param {Object} userInfo - User information for permissions
 * @returns {Promise<Object>} Paginated promotions with count
 */
async function getPromotions(filters, userInfo) {
    try {
        const isManager = ['manager', 'superuser'].includes(userInfo.userRole);
        const now = new Date();
        
        // build where
        const where = {};
        if (filters.name !== undefined && filters.name !== null) {
            where.name = { contains: filters.name };
        }
        if (filters.type !== undefined && filters.type !== null) {
            where.type = filters.type === 'one-time' ? 'one_time' : filters.type;
        }
        
        // Handle started/ended filters (managers only)
        if (isManager) {
            if (filters.started !== undefined && filters.started !== null) {
                where.startTime = filters.started ? { lt: now } : { gt: now };
            }
            
            if (filters.ended !== undefined && filters.ended !== null) {
                where.endTime = filters.ended ? { lt: now } : { gt: now };
            }
        } else {
            // A regular user may only see available promotions, i.e., active 
            // promotions that they have not used. An active promotion is one 
            // that has started, but not ended.
            where.startTime = { lt: now };
            where.endTime = { gt: now };

            where.OR = [
                { type: 'automatic' },
                // if one-time, cannot be used by this user
                {
                    type: 'one_time',
                    NOT: {
                        oneTimeUsed: {
                            some: {
                                id: userInfo.userId
                            }
                        }
                    }
                }
            ];
        }
        
        // Count total promotions matching where clause
        const totalPromotions = await prisma.promotion.count({ where });
        
        // pagination validation
        let page = 1;
        let limit = 10;
        
        if (filters.page !== undefined) {
            if (filters.page < 1) {
                const error = new Error('Invalid page parameter. Page must be a positive integer.');
                error.statusCode = 400;
                throw error;
            }
            page = filters.page;
        }
        
        if (filters.limit !== undefined) {
            if (filters.limit < 1) {
                const error = new Error('Invalid limit parameter. Limit must be a positive integer.');
                error.statusCode = 400;
                throw error;
            }
            limit = filters.limit;
        }
        
        const skip = (page - 1) * limit;

        // Determine orderBy clause based on filters.sort
        let orderBy = {};
        switch (filters.sort) {
          case 'id-asc':
            orderBy = { id: 'asc' };
            break;
          case 'id-desc':
            orderBy = { id: 'desc' };
            break;
          case 'name-asc':
            orderBy = { name: 'asc' };
            break;
          case 'name-desc':
            orderBy = { name: 'desc' };
            break;
          case 'starttime-asc':
            orderBy = { startTime: 'asc' };
            break;
          case 'starttime-desc':
            orderBy = { startTime: 'desc' };
            break;
          case 'endtime-asc':
            orderBy = { endTime: 'asc' };
            break;
          case 'endtime-desc':
            orderBy = { endTime: 'desc' };
            break;
          default:
            orderBy = { id: 'asc' }; // Default ordering
        }
        
        // Get promotions
        const promotions = await prisma.promotion.findMany({
            where,
            skip,
            take: limit,
            orderBy
        });
        
        // Format response, one_time -> one-time
        const results = promotions.map(promotion => {
            const formattedPromotion = {
                id: promotion.id,
                name: promotion.name,
                type: promotion.type === 'one_time' ? 'one-time' : promotion.type,
                endTime: promotion.endTime.toISOString(),
                minSpending: promotion.minSpending,
                rate: promotion.rate,
                points: promotion.points
            };
            
            // manager see extra startTime field
            if (isManager) {
                formattedPromotion.startTime = promotion.startTime.toISOString();
            }
            
            return formattedPromotion;
        });
        
        return {
            count: totalPromotions,
            results
        };
    } 
    
    catch (error) {
        if (!error.statusCode) {
            console.error('Database error getting promotions:', error);
            error.statusCode = 500;
            error.message = 'Error retrieving promotions from database';
        }
        throw error;
    }
}

/**
 * Get a single promotion by ID
 * @param {number} promotionId - The ID of the promotion
 * @param {Object} userInfo - User information for permissions
 * @returns {Promise<Object>} The promotion details
 */
async function getPromotionById(promotionId, userInfo) {
    try {
        // get the promotion
        const promotion = await prisma.promotion.findUnique({
            where: { id: promotionId },
            include: {  // to check if active (used by current user)
                oneTimeUsed: {
                    where: { id: userInfo.userId },
                    select: { id: true }
                }
            }
        });
        if (!promotion) {
            const error = new Error('Promotion not found');
            error.statusCode = 404;
            throw error;
        }
        
        // clearance check
        const isManager = ['manager', 'superuser'].includes(userInfo.userRole);
        const now = new Date();
        
        // Regular users
        if (!isManager) {
            
            // 404 Not Found if the promotion is currently inactive 
            // (not started yet, or have ended).
            const hasStarted = promotion.startTime <= now;
            const hasEnded = promotion.endTime <= now;
            
            if (!hasStarted || hasEnded) {
                const error = new Error('Promotion not active');
                error.statusCode = 404;
                throw error;
            }
            
            // for one-time promotions active = not used & not ended
            if (promotion.type === 'one_time' && promotion.oneTimeUsed.length > 0) {
                const error = new Error('Promotion already used');
                error.statusCode = 404;
                throw error;
            }
        }
        
        // Format the response
        const response = {
            id: promotion.id,
            name: promotion.name,
            description: promotion.description,
            type: promotion.type === 'one_time' ? 'one-time' : promotion.type,
            endTime: promotion.endTime.toISOString(),
            minSpending: promotion.minSpending,
            rate: promotion.rate,
            points: promotion.points
        };
        
        // manager see extra startTime field
        if (isManager) {
            response.startTime = promotion.startTime.toISOString();
        }
        
        return response;
    } 
    
    catch (error) {
        if (!error.statusCode) {
            console.error('Database error getting promotion:', error);
            error.statusCode = 500;
            error.message = 'Error retrieving promotion from database';
        }
        throw error;
    }
}

/**
 * Update an existing promotion
 * @param {number} promotionId - The ID of the promotion to update
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object>} The updated promotion
 */
async function updatePromotion(promotionId, updateData) {
    try {
        // get the promotion
        const existingPromotion = await prisma.promotion.findUnique({
            where: { id: promotionId }
        });
        
        if (!existingPromotion) {
            const error = new Error('Promotion not found');
            error.statusCode = 404;
            throw error;
        }
        
        // validate dates
        const now = new Date();
        const existingStartTime = new Date(existingPromotion.startTime);
        const existingEndTime = new Date(existingPromotion.endTime);
        
        // 400 Bad Request
        // if start time or end time (or both) is in the past.
        let newStartTime = existingStartTime;
        let newEndTime = existingEndTime;
        
        if (updateData.startTime !== undefined) {
            newStartTime = new Date(updateData.startTime);
            
            if (isNaN(newStartTime.getTime())) {
                const error = new Error('Invalid start time format. Must be ISO 8601 format');
                error.statusCode = 400;
                throw error;
            }
            
            if (newStartTime < now) {
                const error = new Error('Start time must not be in the past');
                error.statusCode = 400;
                throw error;
            }
        }
        
        if (updateData.endTime !== undefined) {
            newEndTime = new Date(updateData.endTime);
            
            if (isNaN(newEndTime.getTime())) {
                const error = new Error('Invalid end time format. Must be ISO 8601 format');
                error.statusCode = 400;
                throw error;
            }
            
            if (newEndTime < now) {
                const error = new Error('End time must not be in the past');
                error.statusCode = 400;
                throw error;
            }
        }

        // end time must be after start time
        if (newEndTime <= newStartTime) {
            const error = new Error('End time must be after start time');
            error.statusCode = 400;
            throw error;
        }

        // 400 Bad Request 
        // If update(s) to name, description, type, startTime, minSpending, 
        // rate, or points is made after the original start time has passed.
        // In addition to the above, if update to endTime is made after the 
        // original end time has passed.
        const hasStarted = existingStartTime <= now;
        const hasEnded = existingEndTime <= now;
        if (hasStarted) {
            const restrictedFields = ['name', 'description', 'type', 'startTime', 'minSpending', 'rate', 'points'];
            
            for (const field of restrictedFields) {
                if (updateData[field] !== undefined) {
                    const error = new Error(`Cannot update ${field} after the promotion has started`);
                    error.statusCode = 400;
                    throw error;
                }
            }
        }
        if (hasEnded && updateData.endTime !== undefined) {
            const error = new Error('Cannot update end time after the promotion has ended');
            error.statusCode = 400;
            throw error;
        }
    
        // create update data
        const updateFields = {};
        
        if (updateData.name !== undefined && updateData.name !== null) updateFields.name = updateData.name;
        if (updateData.description !== undefined && updateData.description !== null) updateFields.description = updateData.description;
        if (updateData.type !== undefined && updateData.type !== null) updateFields.type = updateData.type === 'one-time' ? 'one_time' : updateData.type;
        if (updateData.startTime !== undefined && updateData.startTime !== null) updateFields.startTime = newStartTime;
        if (updateData.endTime !== undefined && updateData.endTime !== null) updateFields.endTime = newEndTime;
        if (updateData.minSpending !== undefined && updateData.minSpending !== null) updateFields.minSpending = updateData.minSpending;
        if (updateData.rate !== undefined && updateData.rate !== null) updateFields.rate = updateData.rate;
        if (updateData.points !== undefined && updateData.points !== null) updateFields.points = updateData.points;
        
        // Update the promotion
        const updatedPromotion = await prisma.promotion.update({
            where: { id: promotionId },
            data: updateFields
        });
        
        // Response: The id, name and type, shall always be returned. For 
        // others, only the field(s) updated will be returned
        const response = {
            id: updatedPromotion.id,
            name: updatedPromotion.name,
            type: updatedPromotion.type === 'one_time' ? 'one-time' : updatedPromotion.type
        };
        
        // select fields to include in response. should include null.
        if (updateData.description !== undefined) response.description = updatedPromotion.description;
        if (updateData.startTime !== undefined) response.startTime = updatedPromotion.startTime.toISOString();
        if (updateData.endTime !== undefined) response.endTime = updatedPromotion.endTime.toISOString();
        if (updateData.minSpending !== undefined) response.minSpending = updatedPromotion.minSpending;
        if (updateData.rate !== undefined) response.rate = updatedPromotion.rate;
        if (updateData.points !== undefined) response.points = updatedPromotion.points;
        
        return response;
    } 
    
    catch (error) {
        if (!error.statusCode) {
            console.error('Database error updating promotion:', error);
            error.statusCode = 500;
            error.message = 'Error updating promotion in database';
        }
        throw error;
    }
}

/**
 * Delete a promotion
 * @param {number} promotionId - The ID of the promotion to delete
 * @returns {Promise<void>}
 */
async function deletePromotion(promotionId) {
    try {
        // get the promotion
        const promotion = await prisma.promotion.findUnique({
            where: { id: promotionId }
        });
        if (!promotion) {
            const error = new Error('Promotion not found');
            error.statusCode = 404;
            throw error;
        }
        
        // 403 Forbidden if the promotion has already started.
        const now = new Date();
        if (promotion.startTime <= now) {
            const error = new Error('Failed to delete: promotion already started');
            error.statusCode = 403;
            throw error;
        }
        
        // Delete the promotion
        await prisma.promotion.delete({
            where: { id: promotionId }
        });
        
        return;
    } 
    
    catch (error) {
        if (!error.statusCode) {
            console.error('Database error deleting promotion:', error);
            error.statusCode = 500;
            error.message = 'Error deleting promotion from database';
        }
        throw error;
    }
}

module.exports = {
    createPromotion,
    getPromotions,
    getPromotionById,
    updatePromotion,
    deletePromotion
};
