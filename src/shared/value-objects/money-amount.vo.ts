/**
 * Value Object: MoneyAmount
 *
 * Represents a monetary amount with safe arithmetic operations.
 * Uses integer arithmetic internally (cents) to avoid floating-point issues.
 * All amounts are stored as DECIMAL(14,2) in the database.
 */
export class MoneyAmount {
  private readonly cents: number;

  private constructor(cents: number) {
    this.cents = Math.round(cents);
  }

  /**
   * Create a MoneyAmount from a numeric value (e.g., 100.50)
   */
  static fromNumber(value: number): MoneyAmount {
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

  /**
   * Create a MoneyAmount from a string (e.g., "100.50")
   */
  static fromString(value: string): MoneyAmount {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      throw new Error(`Invalid money amount: "${value}"`);
    }
    return MoneyAmount.fromNumber(parsed);
  }

  /**
   * Create a zero-valued MoneyAmount
   */
  static zero(): MoneyAmount {
    return new MoneyAmount(0);
  }

  add(other: MoneyAmount): MoneyAmount {
    return new MoneyAmount(this.cents + other.cents);
  }

  subtract(other: MoneyAmount): MoneyAmount {
    return new MoneyAmount(this.cents - other.cents);
  }

  isPositive(): boolean {
    return this.cents > 0;
  }

  isZero(): boolean {
    return this.cents === 0;
  }

  isGreaterThan(other: MoneyAmount): boolean {
    return this.cents > other.cents;
  }

  isGreaterThanOrEqual(other: MoneyAmount): boolean {
    return this.cents >= other.cents;
  }

  /**
   * Returns the percentage this amount represents of the total.
   * Returns 0 if total is zero to avoid division by zero.
   */
  percentageOf(total: MoneyAmount): number {
    if (total.isZero()) return 0;
    return Math.round((this.cents / total.cents) * 10000) / 100;
  }

  toNumber(): number {
    return this.cents / 100;
  }

  toString(): string {
    return this.toNumber().toFixed(2);
  }

  equals(other: MoneyAmount): boolean {
    return this.cents === other.cents;
  }
}
