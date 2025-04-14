/*
 * If you need to initialize your database with some data, you may write a script
 * to do so here.
 */
'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { exec } = require('child_process');

async function createSuperuser() {
    return new Promise((resolve, reject) => {
        exec('node prisma/createsu.js clive123 clive.su@mail.utoronto.ca SuperUser123!', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error creating superuser: ${stderr}`);
                reject(error);
            } else {
                console.log(stdout);
                resolve();
            }
        });
    });
}


// Note: all random data is generated using chatGPT: https://www.chatgpt.com/
async function main() {
    await createSuperuser();
    // Create users
    // at least 10, include at least 1 cashier, 1 manager, 1 superuser
    const users = await prisma.user.createMany({
        data: [
            { utorid: 'bobman12', name: 'Bob Manager', role: 'manager', email: 'bobman12@mail.utoronto.ca', password: 'Password@123' },
            { utorid: 'alice123', name: 'Alice Cashier', role: 'cashier', email: 'alice123@mail.utoronto.ca', password: 'Password@123' },
            { utorid: 'charlie1', name: 'Charlie Brown', role: 'cashier', email: 'charlie1@mail.utoronto.ca', password: 'Password@123' },
            { utorid: 'diana123', name: 'Diana Evans', role: 'regular', email: 'diana123@mail.utoronto.ca', password: 'Password@123' },
            { utorid: 'ethan123', name: 'Ethan Williams', role: 'regular', email: 'ethan123@mail.utoronto.ca', password: 'Password@123' },
            { utorid: 'fiona123', name: 'Fiona Davis', role: 'regular', email: 'fiona123@mail.utoronto.ca', password: 'Password@123' },
            { utorid: 'george12', name: 'George Miller', role: 'regular', email: 'george12@mail.utoronto.ca', password: 'Password@123' },
            { utorid: 'hannah12', name: 'Hannah Wilson', role: 'regular', email: 'hannah12@mail.utoronto.ca', password: 'Password@123' },
            { utorid: 'iantay12', name: 'Ian Taylor', role: 'regular', email: 'iantay12@mail.utoronto.ca', password: 'Password@123' },
            { utorid: 'julia123', name: 'Julia Anderson', role: 'regular', email: 'julia123@mail.utoronto.ca', password: 'Password@123' },
        ],
    });

    // Create events
    // at least 5 events (enough to trigger pagination)
    // create 11 events to test the pagination
    const events = await prisma.event.createMany({
        data: [
            { name: 'Networking Night', description: 'An evening to connect with professionals.', location: 'AA1234', startTime: new Date('2024-03-10T18:00:00'), endTime: new Date('2024-03-10T21:00:00'), capacity: 100, points: 20 },
            { name: 'Alumni Meet', description: 'Reuniting alumni for networking and fun.', location: 'BB5678', startTime: new Date('2024-04-15T17:00:00'), endTime: new Date('2024-04-15T20:00:00'), capacity: 150, points: 30 },
            { name: 'Research Fair', description: 'Showcasing innovative research projects.', location: 'CC9101', startTime: new Date('2024-05-20T09:00:00'), endTime: new Date('2024-05-20T15:00:00'), capacity: 200, points: 40 },
            { name: 'Academic Advising', description: 'Guidance for academic success.', location: 'DD2345', startTime: new Date('2024-06-25T10:00:00'), endTime: new Date('2024-06-25T14:00:00'), capacity: 80, points: 15 },
            { name: 'Club Fair', description: 'Explore and join campus clubs.', location: 'EE6789', startTime: new Date('2024-07-10T12:00:00'), endTime: new Date('2024-07-10T16:00:00'), capacity: 300, points: 25 },
            { name: 'Leadership Summit', description: 'Empowering future leaders.', location: 'FF3456', startTime: new Date('2024-08-30T09:00:00'), endTime: new Date('2024-08-30T15:00:00'), capacity: 120, points: 35 },
            { name: 'Multicultural Night', description: 'Celebrating cultural diversity.', location: 'GG7890', startTime: new Date('2024-09-12T18:00:00'), endTime: new Date('2024-09-12T22:00:00'), capacity: 250, points: 50 },
            { name: 'Music Festival', description: 'Enjoy live music performances.', location: 'HH4567', startTime: new Date('2024-10-05T15:00:00'), endTime: new Date('2024-10-05T21:00:00'), capacity: 400, points: 30 },
            { name: 'Orientation', description: 'Welcoming new students to campus.', location: 'II8901', startTime: new Date('2024-11-18T09:00:00'), endTime: new Date('2024-11-18T13:00:00'), capacity: 500, points: 20 },
            { name: 'Health and Wellness Fair', description: 'Promoting health and well-being.', location: 'JJ5678', startTime: new Date('2024-12-10T10:00:00'), endTime: new Date('2024-12-10T14:00:00'), capacity: 300, points: 40 },
            { name: 'Winter Charity', description: 'Supporting local charities through a formal event.', location: 'KK1234', startTime: new Date('2024-01-15T19:00:00'), endTime: new Date('2024-01-15T23:00:00'), capacity: 200, points: 60 },
        ],
    });

    // Create promotions
    // at least 5 promotions (enough to trigger pagination)
    // create 11 promotions to test the pagination
    const promotions = await prisma.promotion.createMany({
        data: [
            { name: 'Holiday Discount', description: 'Special discount for the holiday season.', type: 'automatic', startTime: new Date('2023-12-01T00:00:00'), endTime: new Date('2023-12-31T23:59:59'), minSpending: 50, rate: 10, points: 20 },
            { name: 'New Year Offer', description: 'Celebrate the new year with exclusive offers.', type: 'one-time', startTime: new Date('2024-01-01T00:00:00'), endTime: new Date('2024-01-15T23:59:59'), minSpending: 100, rate: 15, points: 30 },
            { name: 'Spring Sale', description: 'Enjoy discounts during the spring season.', type: 'automatic', startTime: new Date('2024-03-01T00:00:00'), endTime: new Date('2024-03-31T23:59:59'), minSpending: 20, rate: 5, points: 10 },
            { name: 'Summer Bonanza', description: 'Hot deals for the summer.', type: 'one-time', startTime: new Date('2024-06-01T00:00:00'), endTime: new Date('2024-06-30T23:59:59'), minSpending: 75, rate: 20, points: 40 },
            { name: 'Back to School', description: 'Special offers for students.', type: 'automatic', startTime: new Date('2024-08-15T00:00:00'), endTime: new Date('2024-09-15T23:59:59'), minSpending: 30, rate: 10, points: 15 },
            { name: 'Black Friday', description: 'Massive discounts on Black Friday.', type: 'one-time', startTime: new Date('2023-11-24T00:00:00'), endTime: new Date('2023-11-24T23:59:59'), minSpending: 0, rate: 25, points: 50 },
            { name: 'Cyber Monday', description: 'Exclusive online deals.', type: 'automatic', startTime: new Date('2023-11-27T00:00:00'), endTime: new Date('2023-11-27T23:59:59'), minSpending: 0, rate: 20, points: 40 },
            { name: 'Thanksgiving Special', description: 'Celebrate Thanksgiving with discounts.', type: 'one-time', startTime: new Date('2023-11-23T00:00:00'), endTime: new Date('2023-11-23T23:59:59'), minSpending: 50, rate: 15, points: 25 },
            { name: 'Winter Clearance', description: 'Clearance sale for winter items.', type: 'automatic', startTime: new Date('2024-02-01T00:00:00'), endTime: new Date('2024-02-28T23:59:59'), minSpending: 10, rate: 10, points: 15 },
            { name: 'Valentine’s Day Special', description: 'Special offers for Valentine’s Day.', type: 'one-time', startTime: new Date('2024-02-14T00:00:00'), endTime: new Date('2024-02-14T23:59:59'), minSpending: 25, rate: 10, points: 20 },
            { name: 'Halloween Treats', description: 'Spooky discounts for Halloween.', type: 'automatic', startTime: new Date('2023-10-31T00:00:00'), endTime: new Date('2023-10-31T23:59:59'), minSpending: 15, rate: 5, points: 10 },
        ],
    });

    // Create transactions
    // at least 30 transactions, at least 2 per type
    const transactions = await prisma.transaction.createMany({
        data: [
            // Purchases
            { utorid: 'diana123', type: 'purchase', spent: 100, promotionIds: [1, 2], remark: 'Purchase of office supplies' },
            { utorid: 'ethan123', type: 'purchase', spent: 50, promotionIds: [3], remark: 'Purchase of snacks' },
            { utorid: 'fiona123', type: 'purchase', spent: 70, promotionIds: [3], remark: 'Purchase of posters' },
            { utorid: 'george12', type: 'purchase', spent: 10, promotionIds: [5], remark: 'Purchase of supplies' },
            { utorid: 'diana123', type: 'purchase', spent: 200, promotionIds: [7], remark: 'Purchase of snacks' },

            // Adjustments
            { utorid: 'diana123', type: 'adjustment', amount: -10, relatedId: 1, promotionIds: [], remark: 'Refund adjustment' },
            { utorid: 'ethan123', type: 'adjustment', amount: 20, relatedId: 2, promotionIds: [], remark: 'Adjustment for overcharge' },
            { utorid: 'ethan123', type: 'adjustment', amount: 10, relatedId: 2, promotionIds: [4], remark: 'Adjustment for promotion' },
            { utorid: 'fiona123', type: 'adjustment', amount: 50, relatedId: 3, promotionIds: [1], remark: 'Adjustment for promotion' },
            { utorid: 'george12', type: 'adjustment', amount: -2, relatedId: 4, promotionIds: [1, 2] },

            // Transfers
            { userId: 1, type: 'transfer', points: 30, remark: 'Transfer to another user' },
            { userId: 2, type: 'transfer', points: 50, remark: 'Transfer for event participation' },
            { userId: 2, type: 'transfer', points: 50, remark: 'Transfer for event participation' },
            { userId: 2, type: 'transfer', points: 50, remark: 'Transfer for event participation' },
            { userId: 2, type: 'transfer', points: 50, remark: 'Transfer for event participation' },

            // Redemptions
            { utorid: 'ethan123', type: 'redemption', points: 40, remark: 'Redemption for gift card', createdBy: 'bobman12' },

        ],
    });

    console.log('Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
