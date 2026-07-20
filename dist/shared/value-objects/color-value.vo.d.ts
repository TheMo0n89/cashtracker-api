export declare class ColorValue {
    private static readonly HEX_PATTERN;
    private readonly value;
    private constructor();
    static create(value: string): ColorValue;
    static isValid(value: string): boolean;
    toString(): string;
    equals(other: ColorValue): boolean;
}
