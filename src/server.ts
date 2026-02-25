import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { analyticsQueue, analyticsWorker } from './jobs/analytics.job';

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);

    // Schedule the analytics aggregation job to run daily at 01:00 UTC
    await analyticsQueue.add(
        'daily-aggregation',
        {},
        {
            repeat: { pattern: '0 1 * * *' }, // every day at 01:00 UTC
            removeOnComplete: true,
            removeOnFail: false,
        }
    );
    console.log('Analytics job scheduled (daily @ 01:00 UTC)');

    // Keep a reference so the worker isn't garbage collected
    analyticsWorker.on('failed', (job, err) => {
        console.error(`Analytics job ${job?.id} failed:`, err.message);
    });
});
