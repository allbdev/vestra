import 'dotenv/config'
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const freePlan = await prisma.plan.upsert({
        where: { name: 'free' },
        update: {},
        create: {
            name: 'free',
            price: 0,
            isDefault: true,
        },
    })

    const proPlan = await prisma.plan.upsert({
        where: { name: 'pro' },
        update: {
            price: 19.90,
        },
        create: {
            name: 'pro',
            price: 19.90,
            isDefault: false,
        },
    })

    console.log({ freePlan, proPlan })

    // Backfill onboarding for existing users
    const users = await prisma.user.findMany({
        where: {
            onboarding: {
                none: {}
            }
        }
    });

    for (const user of users) {
        await prisma.onboarding.create({
            data: {
                userId: user.id,
                step: 1,
                completed: false
            }
        });
    }

    console.log(`Backfilled onboarding for ${users.length} users.`);
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
