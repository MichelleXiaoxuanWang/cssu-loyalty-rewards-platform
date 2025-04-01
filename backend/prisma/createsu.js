/*
 * Complete this script so that it is able to add a superuser to the database
 * Usage example: 
 *   node prisma/createsu.js clive123 clive.su@mail.utoronto.ca SuperUser123!
 */
'use strict';

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Collect command line arguments
const args = process.argv.slice(2);

if (args.length !== 3) {
  console.error('Wrong format: node prisma/createsu.js <utorid> <UofT email> <password>');
  process.exit(1);
}

// know: correct input format
const [utorid, email, password] = args;

// validate inputs
if (!utorid || !email || !password) {
  console.error('All arguments (utorid, email, password) are required.');
  process.exit(1);
}

// uoft email format
if (!email.endsWith('@mail.utoronto.ca')) {
  console.error('Email must be a valid University of Toronto email (ending with @mail.utoronto.ca)');
  process.exit(1);
}

// Create superuser
async function createSuperuser() {
  try {
    const superuser = await prisma.user.create({
      data: {
        utorid,
        email,
        password,
        name: 'Superuser',
        role: 'superuser',
        verified: true, // Note: Please ensure that your superuser is flagged as verified.
        activated: true,
      }
    });
    
    // debug
    console.log(`Superuser created successfully:
    ID: ${superuser.id}
    UTORid: ${superuser.utorid}
    Email: ${superuser.email}
    Role: ${superuser.role}
    Verified: ${superuser.verified}
    Activated: ${superuser.activated}
    `);

  } catch (error) {
    console.error('Failed to create superuser:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperuser();
