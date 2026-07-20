/**
 * Value Object: ColorValue
 *
 * Validates and holds a hex color value (#RRGGBB format).
 */
export class ColorValue {
  private static readonly HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

  private readonly value: string;

  private constructor(value: string) {
    this.value = value.toLowerCase();
  }

  static create(value: string): ColorValue {
    if (!ColorValue.HEX_PATTERN.test(value)) {
      throw new Error(
        `Invalid color format: "${value}". Expected #RRGGBB format.`,
      );
    }
    return new ColorValue(value);
  }

  static isValid(value: string): boolean {
    return ColorValue.HEX_PATTERN.test(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: ColorValue): boolean {
    return this.value === other.value;
  }
}
