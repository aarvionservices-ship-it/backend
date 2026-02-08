const AnalyticsHLL = require('../models/AnalyticsHLL');
const HyperLogLog = require('../utils/HyperLogLog');

class AnalyticsService {
    constructor() {
        this.buffer = new Map(); // Key: "metric:dimension", Value: HLL
        this.flushInterval = 5000; // 5 seconds
        this.isFlushing = false;

        // Start auto-flush
        setInterval(() => this.flush(), this.flushInterval);
    }

    /**
     * Ingest an event dynamically.
     * @param {string} metric - Event name (e.g., 'page_view')
     * @param {string} dimension - Segment (e.g., 'US', 'device_mobile')
     * @param {string} value - Unique Identifier (e.g., userId, deviceId)
     */
    async ingestEvent(metric, dimension = 'global', value) {
        const key = `${metric}:${dimension}`;

        if (!this.buffer.has(key)) {
            this.buffer.set(key, new HyperLogLog(14));
        }

        const hll = this.buffer.get(key);
        hll.add(value);
    }

    /**
     * Flush buffered sketches to MongoDB with optimistic locking.
     */
    async flush() {
        if (this.isFlushing || this.buffer.size === 0) return;
        this.isFlushing = true;

        const entries = Array.from(this.buffer.entries());
        this.buffer.clear(); // Clear buffer immediately to capture new events in next cycle

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        for (const [key, localHLL] of entries) {
            const [metric, dimension] = key.split(':');
            const id = `${metric}:${dimension}:${today.toISOString().split('T')[0]}`;

            try {
                // Retry loop for optimistic locking
                let saved = false;
                let retries = 3;

                while (!saved && retries > 0) {
                    // 1. Try to find existing doc
                    let doc = await AnalyticsHLL.findOne({ _id: id });

                    if (!doc) {
                        // Create new
                        try {
                            await AnalyticsHLL.create({
                                _id: id,
                                metric,
                                dimension,
                                hll_blob: localHLL.toBuffer(),
                                precision: localHLL.p,
                                window_start: today,
                                window_end: tomorrow,
                                version: 0
                            });
                            saved = true;
                        } catch (err) {
                            if (err.code === 11000) {
                                // Concurrent creation, retry to merge
                                continue;
                            } else {
                                throw err;
                            }
                        }
                    } else {
                        // Merge and Update with version check
                        const dbHLL = new HyperLogLog(doc.precision, doc.hll_blob);
                        dbHLL.merge(localHLL);

                        const result = await AnalyticsHLL.updateOne(
                            { _id: id, version: doc.version },
                            {
                                $set: { hll_blob: dbHLL.toBuffer() },
                                $inc: { version: 1 }
                            }
                        );

                        if (result.modifiedCount > 0) {
                            saved = true;
                        } else {
                            // Version mismatch, retry
                            retries--;
                        }
                    }
                }

                if (!saved) {
                    console.error(`Failed to flush analytics for ${id} after retries.`);
                }

            } catch (err) {
                console.error(`Error flushing analytics ${id}:`, err);
            }
        }

        this.isFlushing = false;
    }

    /**
     * Query analytics for a time range.
     * @param {string} metric 
     * @param {string} dimension 
     * @param {Date} start 
     * @param {Date} end 
     */
    async getEstimate(metric, dimension, start, end) {
        const docs = await AnalyticsHLL.find({
            metric,
            dimension,
            window_start: { $gte: start, $lt: end }
        });

        if (docs.length === 0) return 0;

        // Merge all retrieved sketches
        const finalHLL = new HyperLogLog(docs[0].precision, docs[0].hll_blob);

        for (let i = 1; i < docs.length; i++) {
            const otherHLL = new HyperLogLog(docs[i].precision, docs[i].hll_blob);
            finalHLL.merge(otherHLL);
        }

        return finalHLL.count();
    }
}

module.exports = new AnalyticsService();
