export declare class IconValue {
    private static readonly ALLOWED_ICONS;
    private readonly value;
    private constructor();
    static create(value: string): IconValue;
    static isValid(value: string): boolean;
    static getAllowedIcons(): string[];
    toString(): string;
    equals(other: IconValue): boolean;
}
