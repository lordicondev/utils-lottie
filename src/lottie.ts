import { LottieAnimationInstance, LottieData, LottieProperty, LottiePropertyType, RgbColor, RgbTuple } from "./interfaces";
import { parseColor } from "./parsers";
import { set } from "./utils";

/**
 * Convert to hexadecimal value.
 * @param c - Color component (0-255).
 * @returns Hexadecimal string representation of the color component.
 */
function componentToHex(c: number) {
    const hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
}

/**
 * Helper method for scale value.
 * @param n - Number to convert (0-255).
 * @returns Scaled value in the range of 0 to 1, rounded to three decimal places.
 */
function toUnitVector(n: number) {
    return Math.round((n / 255) * 1000) / 1000;
}

/**
 * Helper method for scale value.
 * @param n - Number to convert (0-1).
 * @returns Scaled value in the range of 0 to 255.
 */
function fromUnitVector(n: number) {
    return Math.round(n * 255);
}

/**
 * Convert from color object to hex value.
 * @param value - Color object containing r, g, b properties.
 * @returns Hexadecimal string representation of the color.
 */
export function rgbToHex(value: RgbColor): string {
    return (
        '#' +
        componentToHex(value.r) +
        componentToHex(value.g) +
        componentToHex(value.b)
    );
}

/**
 * Conver from hex to color object.
 * @param hex - Hexadecimal string representation of the color.
 * @returns RGBColor object containing r, g, b properties.
 */
export function hexToRgb(hex: string): RgbColor {
    let data = parseInt(hex[0] != '#' ? hex : hex.substring(1), 16);
    return {
        r: (data >> 16) & 255,
        g: (data >> 8) & 255,
        b: data & 255,
    };
}

/**
 * Convert hex color to tuple color representation.
 * @param hex - Hexadecimal string representation of the color.
 * @returns RGBTuple representing the color in the range of 0 to 1.
 */
export function hexToTupleColor(hex: string): RgbTuple {
    const {
        r,
        g,
        b
    } = hexToRgb(hex);
    return [toUnitVector(r), toUnitVector(g), toUnitVector(b)];
}

/**
 * Convert tuple color to hex representation.
 * @param value RGBTuple representing the color in the range of 0 to 1.
 * @returns Hexadecimal string representation of the color.
 */
export function tupleColorToHex(value: RgbTuple): string {
    const color: RgbColor = {
        r: fromUnitVector(value[0]),
        g: fromUnitVector(value[1]),
        b: fromUnitVector(value[2]),
    };
    return rgbToHex(color);
}

/**
 * Return all supported customizable properties.
 * @param data Icon data.
 * @param options Options.
 * @returns Array of LottieProperty objects.
 */
export function extractLottieProperties(
    data: LottieData,
    { lottieInstance }: { lottieInstance?: boolean } = {},
): LottieProperty[] {
    const result: any[] = [];

    if (!data || !data.layers) {
        return result;
    }

    data.layers.forEach((layer: any, layerIndex: number) => {
        if (!layer.nm || !layer.ef) {
            return;
        }

        layer.ef.forEach((field: any, fieldIndex: number) => {
            const value = field?.ef?.[0]?.v?.k;
            if (value === undefined) {
                return;
            }

            let path: string | undefined;

            if (lottieInstance) {
                path = `renderer.elements.${layerIndex}.effectsManager.effectElements.${fieldIndex}.effectElements.0.p.v`;
            } else {
                path = `layers.${layerIndex}.ef.${fieldIndex}.ef.0.v.k`;
            }

            let type: LottiePropertyType | undefined;

            if (field.mn === 'ADBE Color Control') {
                type = 'color';
            } else if (field.mn === 'ADBE Slider Control') {
                type = 'slider';
            } else if (field.mn === 'ADBE Point Control') {
                type = 'point';
            } else if (field.mn === 'ADBE Checkbox Control') {
                type = 'checkbox';
            } else if (field.mn.startsWith('Pseudo/')) {
                type = 'feature';
            }

            if (!type) {
                return;
            }

            const name = field.nm.toLowerCase();

            result.push({
                name,
                path,
                value,
                type,
            });
        });
    });

    return result;
}

/**
 * Reset data to default values by indicated properties.
 * @param data Lottie data or animation to reset.
 * @param properties Array of properties to reset.
 */
export function resetLottieProperties(
    data: LottieData | LottieAnimationInstance,
    properties: LottieProperty[],
) {
    for (const property of properties) {
        set(data, property.path, property.value);
    }
}

/**
 * Update data to value by indicated properties.
 * @param data Lottie data or animation to update.
 * @param properties Array of properties to update.
 * @param value New value to set.
 */
export function updateLottieProperties(
    data: LottieData | LottieAnimationInstance,
    properties: LottieProperty[],
    value: any,
) {
    for (const property of properties) {
        if (property.type === 'color') {
            if (typeof value === 'object' && 'r' in value && 'g' in value && 'b' in value) {
                set(data, property.path, [toUnitVector(value.r), toUnitVector(value.g), toUnitVector(value.b)]);
            } else if (Array.isArray(value)) {
                set(data, property.path, value);
            } else if (typeof value === 'string') {
                set(data, property.path, hexToTupleColor(parseColor(value)));
            }
        } else if (property.type === 'point') {
            if (typeof value === 'object' && 'x' in value && 'y' in value) {
                set(data, property.path + '.0', value.x);
                set(data, property.path + '.1', value.y);
            } else if (Array.isArray(value)) {
                set(data, property.path + '.0', value[0]);
                set(data, property.path + '.1', value[1]);
            }
        } else {
            set(data, property.path, value);
        }
    }
}