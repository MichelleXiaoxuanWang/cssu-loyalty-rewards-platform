// validationUtils.js
// A generic helper that extracts and validates request data against a provided schema from req.body.
// The schema should have a structure like:
// {
//    fieldName: { required: true/false, type: 'string'|'integer'|'float'|'boolean'|'array', min, max, allowedValues, nullable: true/false }
// }
function validateRequest(req, schema) {
    const data = req.body;
    const validated = {};

    // Validate each field defined in the schema
    for (const key in schema) {
        const rules = schema[key];
        let value = data[key];

        // Treat blank values as null for nullable fields
        if (rules.nullable && value === "") {
            value = null;
        }

        // Check for required fields
        if (rules.required && (value == undefined || value == null)) {
            const error = new Error(`The field '${key}' is required.`);
            error.statusCode = 400;
            throw error;
        }

        if (value !== undefined && value !== null) {
            switch (rules.type) {
                case 'string':
                    if (typeof value !== 'string') {
                        const error = new Error(`The field '${key}' must be a string.`);
                        error.statusCode = 400;
                        throw error;
                    }
                    if (rules.min !== undefined && value.length < rules.min) {
                        const error = new Error(`The field '${key}' must be at least ${rules.min} characters long.`);
                        error.statusCode = 400;
                        throw error;
                    }
                    if (rules.max !== undefined && value.length > rules.max) {
                        const error = new Error(`The field '${key}' must be at most ${rules.max} characters long.`);
                        error.statusCode = 400;
                        throw error;
                    }
                    break;
                case 'integer':
                    if (typeof value === 'string') {
                        value = parseInt(value);
                    }
                    if (isNaN(value) || typeof value !== 'number' || !Number.isInteger(value)) {
                        const error = new Error(`The field '${key}' must be an integer.`);
                        error.statusCode = 400;
                        throw error;
                    }
                    if (rules.min !== undefined && value < rules.min) {
                        const error = new Error(`The field '${key}' must be at least ${rules.min}.`);
                        error.statusCode = 400;
                        throw error;
                    }
                    if (rules.max !== undefined && value > rules.max) {
                        const error = new Error(`The field '${key}' must be at most ${rules.max}.`);
                        error.statusCode = 400;
                        throw error;
                    }
                    break;
                case 'float':
                    if (typeof value === 'string') {
                        value = parseFloat(value);
                    }
                    if (isNaN(value) || typeof value !== 'number') {
                        const error = new Error(`The field '${key}' must be a float.`);
                        error.statusCode = 400;
                        throw error;
                    }
                    if (rules.min !== undefined && value < rules.min) {
                        const error = new Error(`The field '${key}' must be at least ${rules.min}.`);
                        error.statusCode = 400;
                        throw error;
                    }
                    if (rules.max !== undefined && value > rules.max) {
                        const error = new Error(`The field '${key}' must be at most ${rules.max}.`);
                        error.statusCode = 400;
                        throw error;
                    }
                    break;
                case 'boolean':
                    if (typeof value !== 'boolean') {
                        const error = new Error(`The field '${key}' must be a boolean.`);
                        error.statusCode = 400;
                        throw error;
                    }
                    break;
                case 'array':
                    if (!Array.isArray(value)) {
                        // If empty array was sent as [], it may be parsed as an empty object
                        if (typeof value === 'object' && Object.keys(value).length === 0) {
                            value = [];
                        } else {
                            const error = new Error(`The field '${key}' must be an array.`);
                            error.statusCode = 400;
                            throw error;
                        }
                    }
                    
                    // Validate array length if specified
                    if (rules.min !== undefined && value.length < rules.min) {
                        const error = new Error(`The field '${key}' must have at least ${rules.min} items.`);
                        error.statusCode = 400;
                        throw error;
                    }
                    if (rules.max !== undefined && value.length > rules.max) {
                        const error = new Error(`The field '${key}' must have at most ${rules.max} items.`);
                        error.statusCode = 400;
                        throw error;
                    }
                    
                    // Validate array item types if specified
                    if (rules.itemType) {
                        for (let i = 0; i < value.length; i++) {
                            const item = value[i];
                            switch (rules.itemType) {
                                case 'integer':
                                    if (typeof item === 'string') {
                                        value[i] = parseInt(item);
                                    }
                                    if (isNaN(value[i]) || typeof value[i] !== 'number' || !Number.isInteger(value[i])) {
                                        const error = new Error(`All items in '${key}' must be integers.`);
                                        error.statusCode = 400;
                                        throw error;
                                    }
                                    break;
                                case 'string':
                                    if (typeof item !== 'string') {
                                        const error = new Error(`All items in '${key}' must be strings.`);
                                        error.statusCode = 400;
                                        throw error;
                                    }
                                    break;
                                // Add other item types as needed
                            }
                        }
                    }
                    break;
                default:
                    const error = new Error(`Invalid type specified for field '${key}'.`);
                    error.statusCode = 400;
                    throw error;
            }

            // Validate allowed values if provided
            if (rules.allowedValues && !rules.allowedValues.includes(value)) {
                const error = new Error(`The field '${key}' must be one of the following values: ${rules.allowedValues.join(', ')}.`);
                error.statusCode = 400;
                throw error;
            }

            // if the field is email, check if it is a valid UofT email
            if (key === 'email') {
                if (!value.endsWith('@mail.utoronto.ca')) {
                    const error = new Error('Invalid UofT email address.');
                    error.statusCode = 400;
                    throw error;
                }
            }

            // Save the validated (and possibly converted) value
            validated[key] = value;
        }
    }

    // Ensure there is no extra field in the request body that is not defined in the schema.
    for (const key in data) {
        if (!schema.hasOwnProperty(key)) {
            const error = new Error(`The field '${key}' is not allowed.`);
            error.statusCode = 400;
            throw error;
        }
    }
    
    return validated;
}

module.exports = { validateRequest };