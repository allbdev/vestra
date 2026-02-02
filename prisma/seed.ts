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
