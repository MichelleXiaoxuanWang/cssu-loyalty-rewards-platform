// paginationUtils.js
// A helper function to handle pagination and filtering for GET requests.
// Prerequisites:
// - req: the request object
// - where: an object representing additional filters for the query
// - modelName: a string matching the desired model name on the Prisma client
// - options: optional object containing select or include for the query
//
// It returns an object with the count of total results and the paginated results.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function paginate(req, where, modelName, options = {}, orderBy) {
    // Ensure page and limit are positive integers
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    
    // Validate minimum values
    if (limit < 1 || page < 1) {
        // error code 400
        const error = new Error('Invalid page or limit');
        error.statusCode = 400;
        throw error;
    }
    
    const skip = (page - 1) * limit;
    
    const query = {
        where,
        skip,
        take: limit,
        ...options,  // include select or include if provided,
        orderBy: orderBy
    };
    
    // query the database
    const results = await prisma[modelName].findMany(query);
    const total = await prisma[modelName].count({ where });
    
    // Return format according to API specification:
    // { count: total, results: [...] }
    return {
        count: total,
        results
    };
}

module.exports = { paginate };