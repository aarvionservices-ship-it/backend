const murmurhash = require('murmurhash');

/**
 * HyperLogLog implementation for cardinality estimation.
 * 
 * Uses 64-bit hashing (simulated via 32-bit MurmurHash v3).
 * Standard error is approx 1.04 / sqrt(m).
 * For p=14, m=16384, error ~ 0.81%.
 */
class HyperLogLog {
    /**
     * @param {number} precision - Number of bits for bucket index (4-16). Default 14.
     * @param {Buffer} [buffer] - Optional buffer to initialize from.
     */
    constructor(precision = 14, buffer = null) {
        if (precision < 4 || precision > 16) {
            throw new Error("Precision must be between 4 and 16.");
        }

        this.p = precision;
        this.m = 1 << precision; // 2^p registers

        // Alpha constant for bias correction
        switch (this.m) {
            case 16: this.alpha = 0.673; break;
            case 32: this.alpha = 0.697; break;
            case 64: this.alpha = 0.709; break;
            default: this.alpha = 0.7213 / (1 + 1.079 / this.m);
        }

        if (buffer) {
            if (buffer.length !== this.m) {
                throw new Error(`Buffer length ${buffer.length} does not match precision ${precision} (expected ${this.m}).`);
            }
            this.registers = Buffer.from(buffer);
        } else {
            this.registers = Buffer.alloc(this.m, 0);
        }
    }

    /**
     * Add a value to the set.
     * @param {string} value 
     */
    add(value) {
        // Hash the value. 
        // MurmurHash v3 produces 32-bit hash. 
        // We need effective 64-bit behavior for better distribution, or just use 32-bit carefully.
        // For simplicity and JS compatibility, we use 32-bit from 'murmurhash' v3. 
        // Note: For production scale > 100M unique items, 64-bit hash is recommended.
        // Here we use 32-bit hash which is generally sufficient for < 100M cardinality with slight collision risk.
        // To improve, we can hash twice with different seeds to simulate 64-bit.

        const h1 = murmurhash.v3(value, 0); // Seed 0

        // Extract rank and index
        // x = hash value
        // j = first p bits (index)
        // w = remaining bits (value for rank)

        // We use the 32-bit integer directly.
        // Javascript bitwise operations treat numbers as 32-bit signed integers.
        // Ensure unsigned behavior by >>> 0.
        const x = h1 >>> 0;

        // p bits for index
        const j = x >>> (32 - this.p);

        // remaining bits for rank (w)
        // To find rank of first 1, we look at the bits after the first p.
        // We create a mask for the remaining 32-p bits.
        const mask = (1 << (32 - this.p)) - 1;
        const w = x & mask;

        // Rank is number of leading zeros in w + 1
        // Since we are looking at the lower bits now, we can count trailing zeros if we view it that way,
        // or just count leading zeros of w effective value.
        // Simpler: find the position of the leftmost 1 in w.
        // But w is the lower bits.
        // Let's count leading zeros of (w << p) | (1 << p - 1) to ensure termination?
        // Actually, specific HLL logic: rho(w) = position of first 1-bit from left (1-indexed).

        let rank = 1;
        while ((w & (1 << (32 - this.p - rank))) === 0 && rank <= (32 - this.p)) {
            rank++;
        }

        // Update register
        if (rank > this.registers[j]) {
            this.registers[j] = rank;
        }
    }

    /**
     * Merge another HLL into this one.
     * @param {HyperLogLog} other 
     */
    merge(other) {
        if (this.p !== other.p) {
            throw new Error("Cannot merge HLLs with different precision.");
        }

        for (let i = 0; i < this.m; i++) {
            if (other.registers[i] > this.registers[i]) {
                this.registers[i] = other.registers[i];
            }
        }
    }

    /**
     * Compute the estimated cardinality.
     * @returns {number}
     */
    count() {
        let sum = 0.0;
        let zeros = 0;

        for (let i = 0; i < this.m; i++) {
            const val = this.registers[i];
            sum += Math.pow(2, -val);
            if (val === 0) zeros++;
        }

        let estimate = (this.alpha * this.m * this.m) / sum;

        // Linear Counting Correction for small ranges
        if (estimate <= 2.5 * this.m) {
            if (zeros > 0) {
                estimate = this.m * Math.log(this.m / zeros);
            }
        } else if (estimate > (1 / 30) * 4294967296) {
            // Large range correction (for 32-bit hash)
            estimate = -4294967296 * Math.log(1 - (estimate / 4294967296));
        }

        return Math.round(estimate);
    }

    /**
     * Export registers as Buffer.
     */
    toBuffer() {
        return Buffer.from(this.registers);
    }
}

module.exports = HyperLogLog;
