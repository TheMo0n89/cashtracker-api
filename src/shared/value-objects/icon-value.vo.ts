/**
 * Value Object: IconValue
 *
 * Validates icon names against a predefined set of allowed icons.
 * Uses a common icon naming convention compatible with react-icons or similar libraries.
 */
export class IconValue {
  private static readonly ALLOWED_ICONS = new Set([
    // Income icons
    'wallet',
    'briefcase',
    'trending-up',
    'dollar-sign',
    'gift',
    'award',
    'credit-card',
    'bank',
    'piggy-bank',
    'coins',
    // Expense icons
    'home',
    'car',
    'utensils',
    'shopping-cart',
    'shopping-bag',
    'heart',
    'activity',
    'book',
    'film',
    'music',
    'plane',
    'train',
    'bus',
    'coffee',
    'smartphone',
    'wifi',
    'zap',
    'droplet',
    'sun',
    'shield',
    'graduation-cap',
    'baby',
    'dog',
    'cat',
    'scissors',
    'wrench',
    'tool',
    'package',
    'truck',
    'receipt',
    'file-text',
    // General
    'circle',
    'tag',
    'folder',
    'star',
    'flag',
    'target',
    'layers',
    'grid',
  ]);

  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): IconValue {
    const normalized = value.toLowerCase().trim();
    if (!IconValue.ALLOWED_ICONS.has(normalized)) {
      throw new Error(
        `Invalid icon: "${value}". Use one of: ${[...IconValue.ALLOWED_ICONS].join(', ')}`,
      );
    }
    return new IconValue(normalized);
  }

  static isValid(value: string): boolean {
    return IconValue.ALLOWED_ICONS.has(value.toLowerCase().trim());
  }

  static getAllowedIcons(): string[] {
    return [...IconValue.ALLOWED_ICONS];
  }

  toString(): string {
    return this.value;
  }

  equals(other: IconValue): boolean {
    return this.value === other.value;
  }
}
