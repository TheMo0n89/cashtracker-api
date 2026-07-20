"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IconValue = void 0;
class IconValue {
    static ALLOWED_ICONS = new Set([
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
        'circle',
        'tag',
        'folder',
        'star',
        'flag',
        'target',
        'layers',
        'grid',
    ]);
    value;
    constructor(value) {
        this.value = value;
    }
    static create(value) {
        const normalized = value.toLowerCase().trim();
        if (!IconValue.ALLOWED_ICONS.has(normalized)) {
            throw new Error(`Invalid icon: "${value}". Use one of: ${[...IconValue.ALLOWED_ICONS].join(', ')}`);
        }
        return new IconValue(normalized);
    }
    static isValid(value) {
        return IconValue.ALLOWED_ICONS.has(value.toLowerCase().trim());
    }
    static getAllowedIcons() {
        return [...IconValue.ALLOWED_ICONS];
    }
    toString() {
        return this.value;
    }
    equals(other) {
        return this.value === other.value;
    }
}
exports.IconValue = IconValue;
//# sourceMappingURL=icon-value.vo.js.map