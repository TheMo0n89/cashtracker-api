"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorValue = void 0;
class ColorValue {
    static HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;
    value;
    constructor(value) {
        this.value = value.toLowerCase();
    }
    static create(value) {
        if (!ColorValue.HEX_PATTERN.test(value)) {
            throw new Error(`Invalid color format: "${value}". Expected #RRGGBB format.`);
        }
        return new ColorValue(value);
    }
    static isValid(value) {
        return ColorValue.HEX_PATTERN.test(value);
    }
    toString() {
        return this.value;
    }
    equals(other) {
        return this.value === other.value;
    }
}
exports.ColorValue = ColorValue;
//# sourceMappingURL=color-value.vo.js.map