"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoneyAmount = void 0;
class MoneyAmount {
    cents;
    constructor(cents) {
        this.cents = Math.round(cents);
    }
    static fromNumber(value) {
        if (!Number.isFinite(value)) {
            throw new Error('MoneyAmount must be a finite number');
        }
        if (value < 0) {
            throw new Error('MoneyAmount cannot be negative');
        }
        if (value > 999999999999.99) {
            throw new Error('MoneyAmount exceeds maximum allowed value');
        }
        return new MoneyAmount(value * 100);
    }
    static fromString(value) {
        const parsed = parseFloat(value);
        if (isNaN(parsed)) {
            throw new Error(`Invalid money amount: "${value}"`);
        }
        return MoneyAmount.fromNumber(parsed);
    }
    static zero() {
        return new MoneyAmount(0);
    }
    add(other) {
        return new MoneyAmount(this.cents + other.cents);
    }
    subtract(other) {
        return new MoneyAmount(this.cents - other.cents);
    }
    isPositive() {
        return this.cents > 0;
    }
    isZero() {
        return this.cents === 0;
    }
    isGreaterThan(other) {
        return this.cents > other.cents;
    }
    isGreaterThanOrEqual(other) {
        return this.cents >= other.cents;
    }
    percentageOf(total) {
        if (total.isZero())
            return 0;
        return Math.round((this.cents / total.cents) * 10000) / 100;
    }
    toNumber() {
        return this.cents / 100;
    }
    toString() {
        return this.toNumber().toFixed(2);
    }
    equals(other) {
        return this.cents === other.cents;
    }
}
exports.MoneyAmount = MoneyAmount;
//# sourceMappingURL=money-amount.vo.js.map