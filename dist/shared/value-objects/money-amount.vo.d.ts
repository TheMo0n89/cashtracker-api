export declare class MoneyAmount {
    private readonly cents;
    private constructor();
    static fromNumber(value: number): MoneyAmount;
    static fromString(value: string): MoneyAmount;
    static zero(): MoneyAmount;
    add(other: MoneyAmount): MoneyAmount;
    subtract(other: MoneyAmount): MoneyAmount;
    isPositive(): boolean;
    isZero(): boolean;
    isGreaterThan(other: MoneyAmount): boolean;
    isGreaterThanOrEqual(other: MoneyAmount): boolean;
    percentageOf(total: MoneyAmount): number;
    toNumber(): number;
    toString(): string;
    equals(other: MoneyAmount): boolean;
}
