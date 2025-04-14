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
        exec('node prisma/createsu.js admin123 admin@mail.utoronto.ca Password@123', (error, stdout, stderr) => {
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
            { id: 2, utorid: 'bobman12', name: 'Bob Manager', role: 'manager', email: 'bobman12@mail.utoronto.ca', password: 'Password@123', verified: true, activated: true },
            { id: 3, utorid: 'alice123', name: 'Alice Cashier', role: 'cashier', email: 'alice123@mail.utoronto.ca', password: 'Password@123', verified: true, activated: true },
            { id: 4, utorid: 'charlie1', name: 'Charlie Brown', role: 'cashier', email: 'charlie1@mail.utoronto.ca', password: 'Password@123', verified: true, activated: true },
            { id: 5, utorid: 'diana123', name: 'Diana Evans', role: 'regular', email: 'diana123@mail.utoronto.ca', password: 'Password@123', verified: true, activated: true },
            { id: 6, utorid: 'ethan123', name: 'Ethan Williams', role: 'regular', email: 'ethan123@mail.utoronto.ca', password: 'Password@123', verified: true, activated: true },
            { id: 7, utorid: 'fiona123', name: 'Fiona Davis', role: 'regular', email: 'fiona123@mail.utoronto.ca', password: 'Password@123', verified: true, activated: true },
            { id: 8, utorid: 'george12', name: 'George Miller', role: 'regular', email: 'george12@mail.utoronto.ca', password: 'Password@123', verified: true, activated: true },
            { id: 9, utorid: 'hannah12', name: 'Hannah Wilson', role: 'regular', email: 'hannah12@mail.utoronto.ca', password: 'Password@123', verified: true, activated: true },
            { id: 10, utorid: 'iantay12', name: 'Ian Taylor', role: 'regular', email: 'iantay12@mail.utoronto.ca', password: 'Password@123', verified: true, activated: true },
            { id: 11, utorid: 'julia123', name: 'Julia Anderson', role: 'regular', email: 'julia123@mail.utoronto.ca', password: 'Password@123', verified: true, activated: true },
        ],
    });

    // Create events
    // at least 5 events (enough to trigger pagination)
    // create 11 events to test the pagination
    const events = await prisma.event.createMany({
        data: [
            { id: 1, name: 'Networking Night', description: 'An evening to connect with professionals.', location: 'AA1234', startTime: new Date('2024-03-10T18:00:00'), endTime: new Date('2024-03-10T21:00:00'), capacity: 100, pointsAllocated: 20, published: true },
            { id: 2, name: 'Alumni Meet', description: 'Reuniting alumni for networking and fun.', location: 'BB5678', startTime: new Date('2024-04-15T17:00:00'), endTime: new Date('2024-04-15T20:00:00'), capacity: 150, pointsAllocated: 30, published: true },
            { id: 3, name: 'Research Fair', description: 'Showcasing innovative research projects.', location: 'CC9101', startTime: new Date('2024-05-20T09:00:00'), endTime: new Date('2024-05-20T15:00:00'), capacity: 200, pointsAllocated: 40, published: true },
            { id: 4, name: 'Academic Advising', description: 'Guidance for academic success.', location: 'DD2345', startTime: new Date('2024-06-25T10:00:00'), endTime: new Date('2024-06-25T14:00:00'), capacity: 80, pointsAllocated: 15, published: true },
            { id: 5, name: 'Club Fair', description: 'Explore and join campus clubs.', location: 'EE6789', startTime: new Date('2024-07-10T12:00:00'), endTime: new Date('2024-07-10T16:00:00'), capacity: 300, pointsAllocated: 25, published: true },
            { id: 6, name: 'Leadership Summit', description: 'Empowering future leaders.', location: 'FF3456', startTime: new Date('2024-08-30T09:00:00'), endTime: new Date('2024-08-30T15:00:00'), capacity: 120, pointsAllocated: 35, published: true },
            { id: 7, name: 'Multicultural Night', description: 'Celebrating cultural diversity.', location: 'GG7890', startTime: new Date('2024-09-12T18:00:00'), endTime: new Date('2024-09-12T22:00:00'), capacity: 250, pointsAllocated: 50, published: true },
            { id: 8, name: 'Music Festival', description: 'Enjoy live music performances.', location: 'HH4567', startTime: new Date('2024-10-05T15:00:00'), endTime: new Date('2024-10-05T21:00:00'), capacity: 400, pointsAllocated: 30, published: true },
            { id: 9, name: 'Orientation', description: 'Welcoming new students to campus.', location: 'II8901', startTime: new Date('2024-11-18T09:00:00'), endTime: new Date('2024-11-18T13:00:00'), capacity: 500, pointsAllocated: 20, published: true },
            { id: 10, name: 'Health and Wellness Fair', description: 'Promoting health and well-being.', location: 'JJ5678', startTime: new Date('2025-04-10T10:00:00'), endTime: new Date('2025-04-30T14:00:00'), capacity: 300, pointsAllocated: 300, pointsAwarded: 0, published: true }, // Will set pointsAwarded at the end
            { id: 11, name: 'Final Exam Review Session', description: 'Final exam review session for students.', location: 'KK1234', startTime: new Date('2025-04-01T19:00:00'), endTime: new Date('2025-04-30T23:00:00'), capacity: 200, pointsAllocated: 50, pointsAwarded: 0, published: true}, // Will set pointsAwarded at the end
            { id: 12, name: 'Summer School Orientation', description: 'Welcoming students to summer school.', location: 'LL1234', startTime: new Date('2025-04-20T19:00:00'), endTime: new Date('2025-04-30T23:00:00'), capacity: 500, pointsAllocated: 1000, published: false},
        ],
    });

    // Create promotions
    // at least 5 promotions (enough to trigger pagination)
    // create 11 promotions to test the pagination
    const promotions = await prisma.promotion.createMany({
        data: [
            { id: 1, name: 'Holiday Discount', description: 'Special discount for the holiday season.', type: 'automatic', startTime: new Date('2023-12-01T00:00:00'), endTime: new Date('2023-12-31T23:59:59'), minSpending: 50, rate: 10, points: 20 },
            { id: 2, name: 'New Year Offer', description: 'Celebrate the new year with exclusive offers.', type: 'one_time', startTime: new Date('2024-01-01T00:00:00'), endTime: new Date('2024-01-15T23:59:59'), minSpending: 100, rate: 15, points: 30 },
            { id: 3, name: 'Spring Sale', description: 'Enjoy discounts during the spring season.', type: 'automatic', startTime: new Date('2024-03-01T00:00:00'), endTime: new Date('2024-03-31T23:59:59'), minSpending: 20, rate: 5, points: 10 },
            { id: 4, name: 'Summer Bonanza', description: 'Hot deals for the summer.', type: 'one_time', startTime: new Date('2024-06-01T00:00:00'), endTime: new Date('2024-06-30T23:59:59'), minSpending: 75, rate: 20, points: 40 },
            { id: 5, name: 'Back to School', description: 'Special offers for students.', type: 'automatic', startTime: new Date('2024-08-15T00:00:00'), endTime: new Date('2024-09-15T23:59:59'), minSpending: 30, rate: 10, points: 15 },
            { id: 6, name: 'Black Friday', description: 'Massive discounts on Black Friday.', type: 'one_time', startTime: new Date('2023-11-24T00:00:00'), endTime: new Date('2023-11-24T23:59:59'), minSpending: 0, rate: 25, points: 50 },
            { id: 7, name: 'Cyber Monday', description: 'Exclusive online deals.', type: 'automatic', startTime: new Date('2023-11-27T00:00:00'), endTime: new Date('2023-11-27T23:59:59'), minSpending: 0, rate: 20, points: 40 },
            { id: 8, name: 'Thanksgiving Special', description: 'Celebrate Thanksgiving with discounts.', type: 'one_time', startTime: new Date('2023-11-23T00:00:00'), endTime: new Date('2023-11-23T23:59:59'), minSpending: 50, rate: 15, points: 25 },
            { id: 9, name: 'Winter Clearance', description: 'Clearance sale for winter items.', type: 'automatic', startTime: new Date('2024-02-01T00:00:00'), endTime: new Date('2024-02-28T23:59:59'), minSpending: 10, rate: 10, points: 15 },
            { id: 10, name: 'Valentine Day Special', description: 'Special offers for Valentine Day.', type: 'one_time', startTime: new Date('2024-02-14T00:00:00'), endTime: new Date('2024-02-14T23:59:59'), minSpending: 25, rate: 10, points: 20 },
            { id: 11, name: 'Halloween Treats', description: 'Spooky discounts for Halloween.', type: 'automatic', startTime: new Date('2023-10-31T00:00:00'), endTime: new Date('2023-10-31T23:59:59'), minSpending: 15, rate: 5, points: 10 },
            { id: 12, name: 'End of Semester Sale', description: 'Special offers for the end of semester.', type: 'automatic', startTime: new Date('2025-04-01T00:00:00'), endTime: new Date('2025-04-30T23:59:59'), minSpending: 50, points: 5 },
            { id: 13, name: 'Final Exam Season Sale', description: 'Special offers for the final exam season.', type: 'one_time', startTime: new Date('2025-04-01T00:00:00'), endTime: new Date('2025-04-30T23:59:59'), minSpending: 50, points: 20 },
        ],
    });

    // Now add event organizers and guests (using the connect method for many-to-many relationships)
    // For events 10 and 11 that have transactions, let's add organizers and guests
    await prisma.event.update({
        where: { id: 10 },
        data: {
            organizers: {
                connect: [
                    { utorid: 'bobman12' },
                    { utorid: 'iantay12' },
                ]
            },
            guests: {
                connect: [
                    { utorid: 'diana123' },
                    { utorid: 'fiona123' }
                ]
            }
        }
    });

    await prisma.event.update({
        where: { id: 11 },
        data: {
            organizers: {
                connect: [{ utorid: 'bobman12' }]
            },
            guests: {
                connect: [
                    { utorid: 'ethan123' },
                    { utorid: 'george12' }
                ]
            }
        }
    });

    // Track user points for later updating
    const userPoints = {
        'bobman12': 0,
        'alice123': 0,
        'charlie1': 0,
        'diana123': 0,
        'ethan123': 0,
        'fiona123': 0,
        'george12': 0,
        'hannah12': 0,
        'iantay12': 0,
        'julia123': 0,
        'admin123': 0
    };

    // Track event points awarded
    const eventPointsAwarded = {
        10: 0,
        11: 0
    };

    // Create transactions one by one to properly handle the many-to-many relationship with promotions
    // Purchases
    const purchase1 = await prisma.transaction.create({
        data: {
            id: 1,
            utorid: 'diana123',
            type: 'purchase',
            spent: 100,
            amount: 405, // Points earned from purchase
            createdBy: 'alice123',
            remark: 'Purchase of office supplies',
            promotionUsed: {
                connect: [{ id: 12 }]
            }
        }
    });
    userPoints['diana123'] += 405;

    const purchase2 = await prisma.transaction.create({
        data: {
            id: 2,
            utorid: 'ethan123',
            type: 'purchase',
            spent: 50,
            amount: 200, // Points earned from purchase
            createdBy: 'alice123',
            remark: 'Purchase of snacks'
        }
    });
    userPoints['ethan123'] += 200;

    const purchase3 = await prisma.transaction.create({
        data: {
            id: 3,
            utorid: 'fiona123',
            type: 'purchase',
            spent: 70,
            amount: 280, // Points earned from purchase
            createdBy: 'charlie1',
            remark: 'Purchase of posters'
        }
    });
    userPoints['fiona123'] += 280;

    const purchase4 = await prisma.transaction.create({
        data: {
            id: 4,
            utorid: 'george12',
            type: 'purchase',
            spent: 10,
            amount: 40, // Points earned from purchase
            createdBy: 'charlie1',
            remark: 'Purchase of supplies'
        }
    });
    userPoints['george12'] += 40;

    const purchase5 = await prisma.transaction.create({
        data: {
            id: 5,
            utorid: 'diana123',
            type: 'purchase',
            spent: 200,
            amount: 805, // Points earned from purchase
            createdBy: 'charlie1',
            remark: 'Purchase of snacks',
            promotionUsed: {
                connect: [{ id: 12 }]
            }
        }
    });
    userPoints['diana123'] += 805;

    // Adjustments
    const adjustment1 = await prisma.transaction.create({
        data: {
            id: 6, 
            utorid: 'diana123', 
            type: 'adjustment', 
            amount: -10, // Points adjustment (negative)
            relatedId: 1, 
            createdBy: 'bobman12', 
            remark: 'Refund adjustment'
        }
    });
    userPoints['diana123'] += -10;

    const adjustment2 = await prisma.transaction.create({
        data: {
            id: 7, 
            utorid: 'ethan123', 
            type: 'adjustment', 
            amount: 20, // Points adjustment (positive)
            relatedId: 2, 
            createdBy: 'bobman12', 
            remark: 'Adjustment for overcharge'
        }
    });
    userPoints['ethan123'] += 20;

    const adjustment3 = await prisma.transaction.create({
        data: {
            id: 8, 
            utorid: 'ethan123', 
            type: 'adjustment', 
            amount: 5, // Points adjustment (positive)
            relatedId: 2, 
            createdBy: 'bobman12', 
            remark: 'Adjustment for promotion',
            promotionUsed: {
                connect: [{ id: 12 }]
            }
        }
    });
    userPoints['ethan123'] += 5;

    const adjustment4 = await prisma.transaction.create({
        data: {
            id: 9, 
            utorid: 'fiona123', 
            type: 'adjustment', 
            amount: 5, // Points adjustment (positive)
            relatedId: 3, 
            createdBy: 'bobman12', 
            remark: 'Adjustment for promotion',
            promotionUsed: {
                connect: [{ id: 12 }]
            }
        }
    });
    userPoints['fiona123'] += 5;

    const adjustment5 = await prisma.transaction.create({
        data: {
            id: 10, 
            utorid: 'george12', 
            type: 'adjustment', 
            amount: -2, // Points adjustment (negative)
            relatedId: 4, 
            createdBy: 'bobman12', 
            remark: 'Refund adjustment'
        }
    });
    userPoints['george12'] += -2;

    // Transfers
    // For transfer, relatedId is the ID of the other user
    const transfers = await prisma.transaction.createMany({
        data: [
            { id: 11, utorid: 'diana123', type: 'transfer', amount: -50, createdBy: 'diana123', relatedId: 6, relatedUtorid: 'ethan123', remark: 'Diana transfer to Ethan' }, // relatedId now points to Ethan (id 6)
            { id: 12, utorid: 'ethan123', type: 'transfer', amount: 50, createdBy: 'diana123', relatedId: 5, relatedUtorid: 'diana123', remark: 'Ethan receive from Diana' }, // relatedId now points to Diana (id 5)

            { id: 13, utorid: 'fiona123', type: 'transfer', amount: -50, createdBy: 'fiona123', relatedId: 8, relatedUtorid: 'george12', remark: 'Transfer for event participation to George' }, // relatedId now points to George (id 8)
            { id: 14, utorid: 'george12', type: 'transfer', amount: 50, createdBy: 'fiona123', relatedId: 7, relatedUtorid: 'fiona123', remark: 'George receive from Fiona for event participation' }, // relatedId now points to Fiona (id 7)

            { id: 15, utorid: 'diana123', type: 'transfer', amount: -100, createdBy: 'diana123', relatedId: 10, relatedUtorid: 'iantay12', remark: 'Diana transfer to Ian' }, // relatedId now points to Ian (id 10)
            { id: 16, utorid: 'iantay12', type: 'transfer', amount: 100, createdBy: 'diana123', relatedId: 5, relatedUtorid: 'diana123', remark: 'Ian receive from Diana' }, // relatedId now points to Diana (id 5)
            
            { id: 17, utorid: 'iantay12', type: 'transfer', amount: -10, createdBy: 'iantay12', relatedId: 7, relatedUtorid: 'fiona123', remark: 'Ian transfer to Fiona' }, // relatedId now points to Fiona (id 7)
            { id: 18, utorid: 'fiona123', type: 'transfer', amount: 10, createdBy: 'iantay12', relatedId: 10, relatedUtorid: 'iantay12', remark: 'Fiona receive from Ian' }, // relatedId now points to Ian (id 10)

            { id: 19, utorid: 'iantay12', type: 'transfer', amount: -20, createdBy: 'iantay12', relatedId: 9, relatedUtorid: 'hannah12', remark: 'Ian transfer to Hannah' }, // relatedId now points to Hannah (id 9)
            { id: 20, utorid: 'hannah12', type: 'transfer', amount: 20, createdBy: 'iantay12', relatedId: 10, relatedUtorid: 'iantay12', remark: 'Hannah receive from Ian' }, // relatedId now points to Ian (id 10)

            { id: 21, utorid: 'diana123', type: 'transfer', amount: -50, createdBy: 'diana123', relatedId: 2, relatedUtorid: 'bobman12', remark: 'Diana transfer to Bob' }, // relatedId now points to Bob (id 2)
            { id: 22, utorid: 'bobman12', type: 'transfer', amount: 50, createdBy: 'diana123', relatedId: 5, relatedUtorid: 'diana123', remark: 'Bob receive from Diana' }, // relatedId now points to Diana (id 5)
        ]
    });

    // Update points from transfers
    userPoints['diana123'] += -50 - 100 - 50; // -200 (transfers out)
    userPoints['ethan123'] += 50; // +50 (transfers in)
    userPoints['fiona123'] += -50 + 10; // -40 (net transfers)
    userPoints['george12'] += 50 + 10; // +60 (transfers in) - Note: adjusted from original which had a typo
    userPoints['iantay12'] += 100 - 10 - 20; // +70 (net transfers)
    userPoints['hannah12'] += 20; // +20 (transfers in)
    userPoints['bobman12'] += 50; // +50 (transfers in)

    // Redemptions
    // For redemption, relatedId is the user ID of the cashier who processed it
    const redemptions = await prisma.transaction.createMany({
        data: [
            { id: 23, utorid: 'diana123', type: 'redemption', amount: -100, remark: 'Redemption for gift card', createdBy: 'diana123', relatedId: 3, relatedUtorid: 'alice123'}, // relatedId points to Alice cashier (id 3)
            { id: 24, utorid: 'ethan123', type: 'redemption', amount: -50, remark: 'Redemption for gift card', createdBy: 'diana123', relatedId: 3, relatedUtorid: 'alice123'}, // relatedId points to Alice cashier (id 3)
            { id: 25, utorid: 'fiona123', type: 'redemption', amount: -20, remark: 'Redemption for gift card', createdBy: 'diana123', relatedId: 4, relatedUtorid: 'charlie1'}, // relatedId points to Charlie cashier (id 4)
            { id: 26, utorid: 'george12', type: 'redemption', amount: -10, remark: 'Redemption for gift card', createdBy: 'diana123', relatedId: 4, relatedUtorid: 'charlie1'}, // relatedId points to Charlie cashier (id 4)
        ]
    });

    // Update points from redemptions (negative amounts)
    userPoints['diana123'] += -100;
    userPoints['ethan123'] += -50;
    userPoints['fiona123'] += -20;
    userPoints['george12'] += -10;

    // Events
    const eventTransactions = await prisma.transaction.createMany({
        data: [
            { id: 27, utorid: 'diana123', type: 'event', amount: 40, remark: 'Event participation', createdBy: 'bobman12', relatedId: 10},
            { id: 28, utorid: 'ethan123', type: 'event', amount: 5, remark: 'Event participation', createdBy: 'bobman12', relatedId: 11},
            { id: 29, utorid: 'fiona123', type: 'event', amount: 40, remark: 'Event participation', createdBy: 'bobman12', relatedId: 10},
            { id: 30, utorid: 'george12', type: 'event', amount: 5, remark: 'Event participation', createdBy: 'bobman12', relatedId: 11},
        ]
    });

    // Update points from event awards
    userPoints['diana123'] += 40;
    userPoints['ethan123'] += 5;
    userPoints['fiona123'] += 40;
    userPoints['george12'] += 5;

    // Update event points awarded
    eventPointsAwarded[10] += 40 + 40; // 80 points awarded for event 10
    eventPointsAwarded[11] += 5 + 5;   // 10 points awarded for event 11

    // Connect one-time promotion to User who used it (if any)
    // For example, if promotion 13 is a one-time promotion used in a transaction
    await prisma.promotion.update({
        where: { id: 13 },
        data: {
            oneTimeUsed: {
                connect: [{ utorid: 'diana123' }]
            }
        }
    });

    // Update user points in database
    for (const [utorid, points] of Object.entries(userPoints)) {
        await prisma.user.update({
            where: { utorid },
            data: { points }
        });
    }

    // Update event points awarded in database
    for (const [eventId, pointsAwarded] of Object.entries(eventPointsAwarded)) {
        await prisma.event.update({
            where: { id: parseInt(eventId) },
            data: { pointsAwarded }
        });
    }

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
