const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Create a new purchase transaction
 * @param {Object} transactionData - Transaction data
 * @returns {Promise<Object>} Created transaction
 */
async function createPurchaseTransaction(transactionData) {
    try {
        const { utorid, spent, promotionIds = [], remark, createdBy } = transactionData;

        // validate utorid
        // 400 Bad Request when any of the specified promotion IDs are invalid for any reason, e.g., 
        // does not exist, expired, or have been used already.
        const user = await prisma.user.findUnique({
            where: { utorid }
        });
        if (!user) {
            const error = new Error(`User with utorid ${utorid} not found`);
            error.statusCode = 400;
            throw error;
        }

        // validate and process promotions
        let appliedPromotions = [];
        if (promotionIds && promotionIds.length > 0) {
            appliedPromotions = await validatePromotions(promotionIds, spent, user.id);
        }

        // Calculate earned points
        // Base rate: 1 point per 25 cents (0.04 points per cent)
        let earnedPoints = Math.round(spent * 100 * 0.04);
        let additionalPoints = 0;

        // Apply promotions to calculate additional points
        for (const promotion of appliedPromotions) {
            // Check if minimum spending requirement is met
            if (spent >= promotion.minSpending) {
                // Calculate points from rate (if applicable)
                const ratePoints = Math.round(spent * promotion.rate * 100);
                
                // Add flat bonus points (if applicable)
                const bonusPoints = promotion.points;
                
                additionalPoints += ratePoints + bonusPoints;
            }
        }

        // Total earned points
        earnedPoints += additionalPoints;

        // Get creator user
        const creator = await prisma.user.findUnique({
            where: { utorid: createdBy }
        });

        if (!creator) {
            const error = new Error(`Creator with utorid ${createdBy} not found`);
            error.statusCode = 400;
            throw error;
        }

        // For new transactions, suspicious is determined by the creator's status
        const isSuspicious = creator.suspicious;

        // Create transaction in a transaction block
        const result = await prisma.$transaction(async (prisma) => {
            // Create the transaction
            const transaction = await prisma.transaction.create({
                data: {
                    type: 'purchase',
                    spent: spent,
                    amount: earnedPoints,
                    remark: remark || null,
                    suspicious: isSuspicious,
                    utorid: utorid,
                    createdBy: createdBy,
                    promotionUsed: {
                        connect: promotionIds.map(id => ({ id }))
                    }
                },
                include: {
                    promotionUsed: true
                }
            });

            // If not suspicious, update user's points
            if (!isSuspicious) {
                await prisma.user.update({
                    where: { utorid },
                    data: {
                        points: {
                            increment: earnedPoints
                        }
                    }
                });
            } 

            // If one-time promotions were used, mark them as used by this user
            for (const promotion of appliedPromotions) {
                if (promotion.type === 'one_time') {
                    await prisma.promotion.update({
                        where: { id: promotion.id },
                        data: {
                            oneTimeUsed: {
                                connect: { id: user.id }
                            }
                        }
                    });
                }
            }

            return transaction;
        });

        // Format the response
        const response = {
            id: result.id,
            utorid: result.utorid,
            type: result.type,
            spent: result.spent,
            earned: isSuspicious ? 0 : result.amount,   // if suspicious, not awarded points
            remark: result.remark || "",
            promotionIds: result.promotionUsed.map(p => p.id),
            createdBy: result.createdBy,
            createdAt: result.createdAt.toISOString()
        };
        
        return response;
    } catch (error) {
        if (!error.statusCode) {
            console.error('Database error creating purchase transaction:', error);
            error.statusCode = 500;
            error.message = 'Error creating purchase transaction';
        }
        throw error;
    }
}

/**
 * Create a new adjustment transaction
 * @param {Object} transactionData - Transaction data
 * @returns {Promise<Object>} Created transaction
 */
async function createAdjustmentTransaction(transactionData) {
    try {
        const { utorid, amount, relatedId, promotionIds = [], remark, createdBy } = transactionData;

        // validate utorid
        const user = await prisma.user.findUnique({
            where: { utorid }
        });
        if (!user) {
            const error = new Error(`User with utorid ${utorid} not found`);
            error.statusCode = 400;
            throw error;
        }

        // validate related transaction exists
        const relatedTransaction = await prisma.transaction.findUnique({
            where: { id: relatedId }
        });
        if (!relatedTransaction) {
            const error = new Error(`Related transaction with ID ${relatedId} not found`);
            error.statusCode = 404; // Debug 82: expect 404
            throw error;
        }

        // validate promotions (if provided)
        // Piazza @280: B/c this endpoint is just for adjusting the amount for a 
        // certain user after a purchase transaction is made right?
        // Yes. You can simply add the promotions to the list of promotion ids, 
        // and don't preform any calculations with these promotions.
        let appliedPromotions = [];
        if (promotionIds && promotionIds.length > 0) {
            for (const promotionId of promotionIds) {
                const promotion = await prisma.promotion.findUnique({
                    where: { id: promotionId }
                });
                if (!promotion) {
                    const error = new Error(`Promotion with ID ${promotionId} not found`);
                    error.statusCode = 400;
                    throw error;
                }

                appliedPromotions.push(promotion);
            }
        }

        // Create transaction in a transaction to avoid race condition
        const result = await prisma.$transaction(async (prisma) => {
            // Create the transaction
            const transaction = await prisma.transaction.create({
                data: {
                    type: 'adjustment',
                    amount: amount,
                    remark: remark,
                    suspicious: false,
                    utorid: utorid,
                    createdBy: createdBy,
                    relatedId: relatedId,
                    promotionUsed: {
                        connect: promotionIds.map(id => ({ id }))
                    }
                },
                include: {
                    promotionUsed: true
                }
            });

            // Update points for involved users
            await prisma.user.update({
                where: { utorid },
                data: {
                    points: {
                        increment: amount
                    }
                }
            });
            return transaction;
        });

        // Format the response
        const response = {
            id: result.id,
            utorid: result.utorid,
            amount: result.amount,
            type: result.type,
            relatedId: result.relatedId,
            remark: result.remark || "",
            promotionIds: result.promotionUsed.map(p => p.id),
            createdBy: result.createdBy,
            createdAt: result.createdAt.toISOString()
        };
        
        return response;
    } catch (error) {
        if (!error.statusCode) {
            console.error('Database error creating adjustment transaction:', error);
            error.statusCode = 500;
            error.message = 'Error creating adjustment transaction';
        }
        throw error;
    }
}

/**
 * Create a new transfer transaction between the current logged-in user (sender) and the user specified by userId (the recipient)
 * @param {Object} transactionData - Transfer data
 * @returns {Promise<Object>} Created transaction response
 */
async function createTransferTransaction(transactionData) {
    try {
        const { senderUtorid, recipientId, amount, remark } = transactionData;

        // Validate sender exists and is verified
        const sender = await prisma.user.findUnique({
            where: { utorid: senderUtorid }
        });
        
        if (!sender) {
            const error = new Error(`Sender with utorid ${senderUtorid} not found`);
            error.statusCode = 400;
            throw error;
        }
        
        // Check if sender is verified
        if (!sender.verified) {
            const error = new Error('Sender must be verified to transfer points');
            error.statusCode = 403;
            throw error;
        }
        
        // Validate recipient exists
        const recipient = await prisma.user.findUnique({
            where: { id: recipientId }
        });
        
        if (!recipient) {
            const error = new Error(`Recipient with ID ${recipientId} not found`);
            error.statusCode = 404;
            throw error;
        }
        
        // Check if sender has enough points
        if (sender.points < amount) {
            const error = new Error('Insufficient points for transfer');
            error.statusCode = 400;
            throw error;
        }
        
        // Create transaction in a transaction block to ensure atomicity
        const result = await prisma.$transaction(async (prisma) => {
            // Create sender's transaction (negative amount)
            const senderTransaction = await prisma.transaction.create({
                data: {
                    type: 'transfer',
                    amount: -amount, // Negative for sender
                    remark: remark || null,
                    suspicious: false,
                    utorid: senderUtorid,
                    createdBy: senderUtorid, // Self-created
                    relatedId: recipientId, // Related to recipient user
                }
            });
            
            // Create recipient's transaction (positive amount)
            const recipientTransaction = await prisma.transaction.create({
                data: {
                    type: 'transfer',
                    amount: amount, // Positive for recipient
                    remark: remark || null,
                    suspicious: false,
                    utorid: recipient.utorid,
                    createdBy: senderUtorid, // Created by sender
                    relatedId: sender.id, // Related to sender user
                }
            });
            
            // Update points for both users
            await prisma.user.update({
                where: { utorid: senderUtorid },
                data: {
                    points: {
                        decrement: amount
                    }
                }
            });
            
            await prisma.user.update({
                where: { utorid: recipient.utorid },
                data: {
                    points: {
                        increment: amount
                    }
                }
            });
            
            return {
                sender: senderTransaction,
                recipient: recipientTransaction
            };
        });
        
        // Format response based on sender's transaction
        return {
            id: result.sender.id,
            sender: sender.utorid,
            recipient: recipient.utorid,
            type: 'transfer',
            sent: amount, // Use positive value in response
            remark: result.sender.remark || "",
            createdBy: result.sender.createdBy,
            createdAt: result.sender.createdAt.toISOString()
        };
    } catch (error) {
        if (!error.statusCode) {
            console.error('Database error creating transfer transaction:', error);
            error.statusCode = 500;
            error.message = 'Error creating transfer transaction';
        }
        throw error;
    }
}

/**
 * Create a new redemption transaction
 * @param {Object} transactionData - Redemption data
 * @returns {Promise<Object>} Created transaction response
 */
async function createRedemptionTransaction(transactionData) {
    try {
        const { utorid, amount, remark } = transactionData;
        
        // Validate user exists and is verified
        const user = await prisma.user.findUnique({
            where: { utorid }
        });
        
        if (!user) {
            const error = new Error(`User with utorid ${utorid} not found`);
            error.statusCode = 400;
            throw error;
        }
        
        // Check if user is verified
        if (!user.verified) {
            const error = new Error('User must be verified to redeem points');
            error.statusCode = 403;
            throw error;
        }
        
        // Check if user has enough points
        if (user.points < amount) {
            const error = new Error('Insufficient points for redemption');
            error.statusCode = 400;
            throw error;
        }
        
        // Create redemption transaction
        const transaction = await prisma.transaction.create({
            data: {
                type: 'redemption',
                amount: amount, // Store positive value in database
                remark: remark || null,
                suspicious: false,
                utorid: utorid,
                createdBy: utorid, // Self-created
                // relatedId will be set to the ID of the cashier who processes this later
            }
        });
        
        // Format response (no changes to user points yet)
        return {
            id: transaction.id,
            utorid: transaction.utorid,
            type: transaction.type,
            processedBy: null, // Not processed yet
            amount: transaction.amount,
            remark: transaction.remark || "",
            createdBy: transaction.createdBy,
            createdAt: transaction.createdAt.toISOString()
        };
    } catch (error) {
        if (!error.statusCode) {
            console.error('Database error creating redemption transaction:', error);
            error.statusCode = 500;
            error.message = 'Error creating redemption transaction';
        }
        throw error;
    }
}

/**
 * Retrieve a list of transactions owned by the currently logged in user
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Object>} Paginated transactions with count
 */
async function getTransactions(filters) {
    try {
        // Build where clause based on filters
        const where = {};
        
        // Filter by name or utorid
        if (filters.name) {
            where.OR = [
                { utorid: { contains: filters.name } },
                { 
                    user: {
                        name: { contains: filters.name }
                    }
                }
            ];
        }
        
        // Filter by creator
        if (filters.createdBy) {
            where.createdBy = { contains: filters.createdBy };
        }
        
        // Filter by suspicious flag
        if (filters.suspicious !== undefined) {
            where.suspicious = filters.suspicious;
        }
        
        // Filter by promotionId
        if (filters.promotionId) {
            where.promotionUsed = {
                some: { id: filters.promotionId }
            };
        }
        
        // Filter by transaction type
        if (filters.type) {
            where.type = filters.type;
            
            // If relatedId is provided with type
            if (filters.relatedId) {
                where.relatedId = filters.relatedId;
            }
        } else if (filters.relatedId) {
            // relatedId without type is not allowed
            const error = new Error('relatedId must be used with type');
            error.statusCode = 400;
            throw error;
        }
        
        // Filter by amount with operator
        if (filters.amount !== undefined) {
            if (!filters.operator) {
                const error = new Error('operator must be provided with amount');
                error.statusCode = 400;
                throw error;
            }
            
            switch (filters.operator) {
                case 'gte':
                    where.OR = [
                        { amount: { gte: filters.amount } },
                        { amount: { lte: -filters.amount } }
                    ];
                    break;
                case 'lte':
                    where.AND = [
                        { amount: { lte: filters.amount } },
                        { amount: { gte: -filters.amount } }
                    ];
                    break;
                default:
                    const error = new Error('operator must be "gte" or "lte"');
                    error.statusCode = 400;
                    throw error;
            }
        } else if (filters.operator) {
            // operator without amount is not allowed
            const error = new Error('amount must be provided with operator');
            error.statusCode = 400;
            throw error;
        }
        
        // Count total transactions matching where clause
        const totalTransactions = await prisma.transaction.count({ where });
        
        // Pagination
        const page = filters.page || 1;
        const limit = filters.limit || 10;

        // validate page and limit
        if (page < 1 || limit < 1) {
            const error = new Error('page and limit must be greater than 0');
            error.statusCode = 400;
            throw error;
        }

        const skip = (page - 1) * limit;
        
        // Handle sorting
        let orderBy = { id: 'desc' }; // Default sorting
        if (filters.sort) {
            const [field, direction] = filters.sort.split('-');
            switch (field) {
                case 'id':
                case 'amount':
                case 'createdAt':
                    orderBy = { [field]: direction === 'desc' ? 'desc' : 'asc' };
                    break;
                case 'type':
                    orderBy = { type: direction === 'desc' ? 'desc' : 'asc' };
                    break;
                default:
                    // Keep default sorting if invalid field
                    break;
            }
        }
        
        // Get transactions
        const transactions = await prisma.transaction.findMany({
            where,
            skip,
            take: limit,
            orderBy,
            include: {
                promotionUsed: {
                    select: { id: true }
                }
            }
        });
        
        // Format response
        const results = transactions.map(formatTransactionResponse);
        
        return {
            count: totalTransactions,
            results
        };
    } catch (error) {
        if (!error.statusCode) {
            console.error('Database error getting transactions:', error);
            error.statusCode = 500;
            error.message = 'Error retrieving transactions from database';
        }
        throw error;
    }
}

/**
 * Get a single transaction by ID
 * @param {number} transactionId - The ID of the transaction
 * @returns {Promise<Object>} The transaction details
 */
async function getTransactionById(transactionId) {
    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: {
                promotionUsed: {
                    select: { id: true }
                }
            }
        });
        if (!transaction) {
            const error = new Error('Transaction not found');
            error.statusCode = 404;
            throw error;
        }
        
        // Format and return the transaction
        const response = formatTransactionResponse(transaction);
        return response;
    } catch (error) {
        if (!error.statusCode) {
            console.error('Database error getting transaction:', error);
            error.statusCode = 500;
            error.message = 'Error retrieving transaction from database';
        }
        throw error;
    }
}

/**
 * Update a transaction's suspicious status
 * @param {number} transactionId - The ID of the transaction
 * @param {boolean} suspicious - The new suspicious status
 * @returns {Promise<Object>} The updated transaction
 */
async function updateSuspiciousStatus(transactionId, suspicious) {
    try {
        // Get the transaction to check if it exists and to get current status
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: {
                promotionUsed: {
                    select: { id: true }
                }
            }
        });
        
        if (!transaction) {
            const error = new Error('Transaction not found');
            error.statusCode = 404;
            throw error;
        }
        
        // No action needed if status is not changing
        if (transaction.suspicious === suspicious) {
            return formatTransactionResponse(transaction);
        }
        
        // Calculate points to adjust
        let pointsAdjustment = 0;
        
        // When marking suspicious, deduct points
        if (suspicious && !transaction.suspicious) {
            pointsAdjustment = -transaction.amount;
        } 
        // When marking not suspicious, add points
        else if (!suspicious && transaction.suspicious) {
            pointsAdjustment = transaction.amount;
        }
        
        // Update transaction in a transaction block
        const result = await prisma.$transaction(async (prisma) => {
            // Update the transaction
            const updatedTransaction = await prisma.transaction.update({
                where: { id: transactionId },
                data: { suspicious },
                include: {
                    promotionUsed: {
                        select: { id: true }
                    }
                }
            });
            
            // Update user's points if needed
            if (pointsAdjustment !== 0) {
                await prisma.user.update({
                    where: { utorid: transaction.utorid },
                    data: {
                        points: {
                            increment: pointsAdjustment
                        }
                    }
                });
            }
            
            return updatedTransaction;
        });
        
        // Format and return the transaction
        return formatTransactionResponse(result);
    } catch (error) {
        if (!error.statusCode) {
            console.error('Database error updating suspicious status:', error);
            error.statusCode = 500;
            error.message = 'Error updating suspicious status';
        }
        throw error;
    }
}

/**
 * Helper function to validate promotions for a purchase
 * @param {Array} promotionIds - Array of promotion IDs
 * @param {number} spent - Amount spent
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Valid promotions
 */
async function validatePromotions(promotionIds, spent, userId) {
    const now = new Date();
    const validPromotions = [];
    
    for (const promotionId of promotionIds) {
        const promotion = await prisma.promotion.findUnique({
            where: { id: promotionId },
            include: {
                oneTimeUsed: {
                    where: { id: userId },
                    select: { id: true }
                }
            }
        });
        
        if (!promotion) {
            const error = new Error(`Promotion with ID ${promotionId} not found`);
            error.statusCode = 400;
            throw error;
        }
        
        // Check if promotion is active (started but not ended)
        if (promotion.startTime > now || promotion.endTime < now) {
            const error = new Error(`Promotion with ID ${promotionId} is not active`);
            error.statusCode = 400;
            throw error;
        }
        if (promotion.type === 'one_time' && promotion.oneTimeUsed.length > 0) {
            const error = new Error(`One-time promotion with ID ${promotionId} has already been used by this user`);
            error.statusCode = 400;
            throw error;
        }
        
        // Check if minimum spending requirement is met
        if (spent < promotion.minSpending) {
            const error = new Error(`Minimum spending requirement of ${promotion.minSpending} not met for promotion with ID ${promotionId}`);
            error.statusCode = 400;
            throw error;
        }
        
        validPromotions.push(promotion);
    }
    
    return validPromotions;
}

/**
 * Helper function to format transaction response
 * @param {Object} transaction - Transaction object from database
 * @returns {Object} Formatted transaction
 */
function formatTransactionResponse(transaction) {
    const formatted = {
        id: transaction.id,
        utorid: transaction.utorid,
        amount: transaction.amount,
        type: transaction.type,
        promotionIds: transaction.promotionUsed.map(p => p.id),
        suspicious: transaction.suspicious,
        remark: transaction.remark || "",
        createdBy: transaction.createdBy,
        createdAt: transaction.createdAt.toISOString()
    };
    
    // Add type-specific fields
    switch (transaction.type) {
        case 'purchase':
            formatted.spent = transaction.spent;
            break;
        case 'adjustment':
        case 'transfer':
        case 'redemption':
        case 'event':
            if (transaction.relatedId !== null) {
                formatted.relatedId = transaction.relatedId;
            }
            
            // For redemption, include redeemed points (same as amount but positive)
            if (transaction.type === 'redemption') {
                formatted.redeemed = Math.abs(transaction.amount);
            }
            break;
    }
    
    return formatted;
}

/**
 * Get transactions for a specific user
 * @param {string} utorid - User utorid
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Object>} Paginated transactions with count
 */
async function getUserTransactions(utorid, filters) {
    try {
        // Build where clause based on filters
        const where = { utorid };
        
        // Filter by transaction type
        if (filters.type) {
            where.type = filters.type;
            
            // If relatedId is provided with type
            if (filters.relatedId) {
                where.relatedId = filters.relatedId;
            }
        } else if (filters.relatedId) {
            // relatedId without type is not allowed
            const error = new Error('relatedId must be used with type');
            error.statusCode = 400;
            throw error;
        }
        
        // Filter by promotionId
        if (filters.promotionId) {
            where.promotionUsed = {
                some: { id: filters.promotionId }
            };
        }
        
        // Filter by amount with operator
        if (filters.amount !== undefined) {
            if (!filters.operator) {
                const error = new Error('operator must be provided with amount');
                error.statusCode = 400;
                throw error;
            }
            
            switch (filters.operator) {
                case 'gte':
                    where.amount = { gte: filters.amount };
                    break;
                case 'lte':
                    where.amount = { lte: filters.amount };
                    break;
                default:
                    const error = new Error('operator must be "gte" or "lte"');
                    error.statusCode = 400;
                    throw error;
            }
        } else if (filters.operator) {
            // operator without amount is not allowed
            const error = new Error('amount must be provided with operator');
            error.statusCode = 400;
            throw error;
        }
        
        // Count total transactions matching where clause
        const totalTransactions = await prisma.transaction.count({ where });
        
        // Pagination
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;
        
        // Get transactions
        const transactions = await prisma.transaction.findMany({
            where,
            skip,
            take: limit,
            orderBy: { id: 'desc' },
            include: {
                promotionUsed: {
                    select: { id: true }
                }
            }
        });
        
        // Format response
        const results = transactions.map(formatTransactionResponse);
        
        return {
            count: totalTransactions,
            results
        };
    } catch (error) {
        if (!error.statusCode) {
            console.error('Database error getting user transactions:', error);
            error.statusCode = 500;
            error.message = 'Error retrieving transactions from database';
        }
        throw error;
    }
}

/**
 * Process a redemption transaction
 * @param {number} transactionId - Transaction ID
 * @param {string} cashierUtorid - Cashier's utorid
 * @returns {Promise<Object>} Processed transaction
 */
async function processRedemptionTransaction(transactionId, cashierUtorid) {
    try {
        // Get the transaction to check if it exists and is redemption type
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: {
                promotionUsed: {
                    select: { id: true }
                }
            }
        });
        
        if (!transaction) {
            const error = new Error('Transaction not found');
            error.statusCode = 404;
            throw error;
        }
        
        
        // Check if transaction is redemption type
        if (transaction.type !== 'redemption') {
            const error = new Error('Only redemption transactions can be processed');
            error.statusCode = 400;
            throw error;
        }
        
        // Check if transaction has already been processed
        if (transaction.relatedId !== null) {
            const error = new Error('Transaction has already been processed');
            error.statusCode = 400;
            throw error;
        }
        
        // DEBUG: case 91 & 92: cannot store utorid in relatedId
        // Find the cashier user id by utorid
        const cashier = await prisma.user.findUnique({
            where: { utorid: cashierUtorid }
        });
        
        if (!cashier) {
            const error = new Error(`Cashier with utorid ${cashierUtorid} not found`);
            error.statusCode = 400;
            throw error;
        }
        
        // Process transaction in a transaction block
        const result = await prisma.$transaction(async (prisma) => {
            // Update the transaction with cashier info
            const updatedTransaction = await prisma.transaction.update({
                where: { id: transactionId },
                data: {
                    relatedId: cashier.id // Store cashier ID (numeric) in relatedId
                },
                include: {
                    promotionUsed: {
                        select: { id: true }
                    }
                }
            });
            
            // Update user's points (deduct the amount)
            await prisma.user.update({
                where: { utorid: transaction.utorid },
                data: {
                    points: {
                        decrement: transaction.amount
                    }
                }
            });
            
            return updatedTransaction;
        });
        
        // Format the response
        const response = {
            id: result.id,
            utorid: result.utorid,
            type: result.type,
            processedBy: cashierUtorid,
            redeemed: result.amount, // Show positive amount as "redeemed"
            remark: result.remark || "",
            createdBy: result.createdBy,
            createdAt: result.createdAt.toISOString()
        };
        
        return response;
    } catch (error) {
        if (!error.statusCode) {
            console.error('Database error processing redemption transaction:', error);
            error.statusCode = 500;
            error.message = 'Error processing redemption transaction';
        }
        throw error;
    }
}

module.exports = {
    createPurchaseTransaction,
    createAdjustmentTransaction,
    createTransferTransaction,
    createRedemptionTransaction,
    getTransactions,
    getTransactionById,
    getUserTransactions,
    updateSuspiciousStatus,
    processRedemptionTransaction
};
