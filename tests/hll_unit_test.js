const HyperLogLog = require('../src/utils/HyperLogLog');

const runTest = () => {
    console.log("Starting HLL Unit Test...");

    const hll = new HyperLogLog(14);
    const uniqueItems = new Set();
    const N = 10000;

    console.log(`Adding ${N} unique items...`);
    for (let i = 0; i < N; i++) {
        const val = `item_${i}_${Math.random()}`;
        uniqueItems.add(val);
        hll.add(val);
    }

    const estimate = hll.count();
    const error = Math.abs(estimate - N) / N;

    console.log(`True Count: ${N}`);
    console.log(`Estimated: ${estimate}`);
    console.log(`Error: ${(error * 100).toFixed(2)}%`);

    if (error < 0.02) {
        console.log("PASS: Accuracy within 2%");
    } else {
        console.log("FAIL: Accuracy > 2%");
    }

    // Test Merge
    console.log("\nTesting Merge...");
    const hll1 = new HyperLogLog(14);
    const hll2 = new HyperLogLog(14);

    for (let i = 0; i < N / 2; i++) {
        hll1.add(`A_${i}`);
    }
    for (let i = 0; i < N / 2; i++) {
        hll2.add(`B_${i}`);
    }

    hll1.merge(hll2);
    const mergedCount = hll1.count();
    const mergeError = Math.abs(mergedCount - N) / N;

    console.log(`Merged Count Expected: ${N}`);
    console.log(`Merged Count Actual: ${mergedCount}`);

    if (mergeError < 0.02) {
        console.log("PASS: Merge Accuracy within 2%");
    } else {
        console.log("FAIL: Merge Accuracy > 2%");
    }
};

runTest();
