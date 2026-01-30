import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import weekday from 'dayjs/plugin/weekday';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(weekday);

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const recurrencies = await db.transactionTemplate.findMany({
            where: {
                active: true,
                deletedAt: null,
            },
        });

        let createdCount = 0;
        const now = dayjs();
        const currentYear = now.year();

        for (const recurrence of recurrencies) {
            if (!recurrence.frequency || !recurrence.startDate) continue;

            // Ensure we treat the start date as a local date (ignoring time)
            const startDate = dayjs(recurrence.startDate);
            const targetDates: dayjs.Dayjs[] = [];

            // 3 = Monthly
            if (recurrence.frequency === 3) {
                // Create for current year
                for (let month = 0; month < 12; month++) {
                    const monthStart = dayjs().year(currentYear).month(month).startOf('month');
                    const daysInMonth = monthStart.daysInMonth();
                    const desiredDay = startDate.date();
                    const checkDay = Math.min(desiredDay, daysInMonth);

                    const targetDate = monthStart.date(checkDay);

                    if (targetDate.isBefore(startDate, 'day')) continue;
                    targetDates.push(targetDate);
                }
            }
            // 2 = Weekly
            else if (recurrence.frequency === 2) {
                // Create for current month
                const startOfMonth = now.startOf('month');
                const endOfMonth = now.endOf('month');
                const desiredDayOfWeek = startDate.day(); // 0-6

                let iter = startOfMonth;
                while (iter.isSameOrBefore(endOfMonth, 'day')) {
                    if (iter.day() === desiredDayOfWeek) {
                        if (!iter.isBefore(startDate, 'day')) {
                            targetDates.push(iter);
                        }
                    }
                    iter = iter.add(1, 'day');
                }
            }
            // 1 = Daily
            else if (recurrence.frequency === 1) {
                // Create for current week
                const startOfWeek = now.startOf('week');
                const endOfWeek = now.endOf('week');

                let iter = startOfWeek;
                while (iter.isSameOrBefore(endOfWeek, 'day')) {
                    if (!iter.isBefore(startDate, 'day')) {
                        targetDates.push(iter);
                    }
                    iter = iter.add(1, 'day');
                }
            }

            for (const date of targetDates) {
                const startOfDay = date.startOf('day').toDate();
                const endOfDay = date.endOf('day').toDate();

                const exists = await db.transaction.findFirst({
                    where: {
                        templateId: recurrence.id,
                        date: {
                            gte: startOfDay,
                            lte: endOfDay,
                        }
                    }
                });

                if (!exists) {
                    await db.transaction.create({
                        data: {
                            workspaceId: recurrence.workspaceId,
                            ownerId: recurrence.ownerId,
                            categoryId: recurrence.categoryId,
                            templateId: recurrence.id,
                            description: recurrence.description,
                            amount: recurrence.baseAmount,
                            date: startOfDay,
                            isPaid: false,
                        }
                    });
                    createdCount++;
                }
            }
        }

        return NextResponse.json({ success: true, created: createdCount });
    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
