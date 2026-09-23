import type { ColorMap } from './interfaces.js';

/**
 * List of supported colors.
 */
const COLORS: Record<string, string> = {
    aliceblue: '#f0f8ff',
    antiquewhite: '#faebd7',
    aqua: '#00ffff',
    aquamarine: '#7fffd4',
    azure: '#f0ffff',
    beige: '#f5f5dc',
    bisque: '#ffe4c4',
    black: '#000000',
    blanchedalmond: '#ffebcd',
    blue: '#0000ff',
    blueviolet: '#8a2be2',
    brown: '#a52a2a',
    burlywood: '#deb887',
    cadetblue: '#5f9ea0',
    chartreuse: '#7fff00',
    chocolate: '#d2691e',
    coral: '#ff7f50',
    cornflowerblue: '#6495ed',
    cornsilk: '#fff8dc',
    crimson: '#dc143c',
    cyan: '#00ffff',
    darkblue: '#00008b',
    darkcyan: '#008b8b',
    darkgoldenrod: '#b8860b',
    darkgray: '#a9a9a9',
    darkgreen: '#006400',
    darkkhaki: '#bdb76b',
    darkmagenta: '#8b008b',
    darkolivegreen: '#556b2f',
    darkorange: '#ff8c00',
    darkorchid: '#9932cc',
    darkred: '#8b0000',
    darksalmon: '#e9967a',
    darkseagreen: '#8fbc8f',
    darkslateblue: '#483d8b',
    darkslategray: '#2f4f4f',
    darkturquoise: '#00ced1',
    darkviolet: '#9400d3',
    deeppink: '#ff1493',
    deepskyblue: '#00bfff',
    dimgray: '#696969',
    dodgerblue: '#1e90ff',
    firebrick: '#b22222',
    floralwhite: '#fffaf0',
    forestgreen: '#228b22',
    fuchsia: '#ff00ff',
    gainsboro: '#dcdcdc',
    ghostwhite: '#f8f8ff',
    gold: '#ffd700',
    goldenrod: '#daa520',
    gray: '#808080',
    green: '#008000',
    greenyellow: '#adff2f',
    honeydew: '#f0fff0',
    hotpink: '#ff69b4',
    indianred: '#cd5c5c',
    indigo: '#4b0082',
    ivory: '#fffff0',
    khaki: '#f0e68c',
    lavender: '#e6e6fa',
    lavenderblush: '#fff0f5',
    lawngreen: '#7cfc00',
    lemonchiffon: '#fffacd',
    lightblue: '#add8e6',
    lightcoral: '#f08080',
    lightcyan: '#e0ffff',
    lightgoldenrodyellow: '#fafad2',
    lightgrey: '#d3d3d3',
    lightgreen: '#90ee90',
    lightpink: '#ffb6c1',
    lightsalmon: '#ffa07a',
    lightseagreen: '#20b2aa',
    lightskyblue: '#87cefa',
    lightslategray: '#778899',
    lightsteelblue: '#b0c4de',
    lightyellow: '#ffffe0',
    lime: '#00ff00',
    limegreen: '#32cd32',
    linen: '#faf0e6',
    magenta: '#ff00ff',
    maroon: '#800000',
    mediumaquamarine: '#66cdaa',
    mediumblue: '#0000cd',
    mediumorchid: '#ba55d3',
    mediumpurple: '#9370db',
    mediumseagreen: '#3cb371',
    mediumslateblue: '#7b68ee',
    mediumspringgreen: '#00fa9a',
    mediumturquoise: '#48d1cc',
    mediumvioletred: '#c71585',
    midnightblue: '#191970',
    mintcream: '#f5fffa',
    mistyrose: '#ffe4e1',
    moccasin: '#ffe4b5',
    navajowhite: '#ffdead',
    navy: '#000080',
    oldlace: '#fdf5e6',
    olive: '#808000',
    olivedrab: '#6b8e23',
    orange: '#ffa500',
    orangered: '#ff4500',
    orchid: '#da70d6',
    palegoldenrod: '#eee8aa',
    palegreen: '#98fb98',
    paleturquoise: '#afeeee',
    palevioletred: '#db7093',
    papayawhip: '#ffefd5',
    peachpuff: '#ffdab9',
    peru: '#cd853f',
    pink: '#ffc0cb',
    plum: '#dda0dd',
    powderblue: '#b0e0e6',
    purple: '#800080',
    rebeccapurple: '#663399',
    red: '#ff0000',
    rosybrown: '#bc8f8f',
    royalblue: '#4169e1',
    saddlebrown: '#8b4513',
    salmon: '#fa8072',
    sandybrown: '#f4a460',
    seagreen: '#2e8b57',
    seashell: '#fff5ee',
    sienna: '#a0522d',
    silver: '#c0c0c0',
    skyblue: '#87ceeb',
    slateblue: '#6a5acd',
    slategray: '#708090',
    snow: '#fffafa',
    springgreen: '#00ff7f',
    steelblue: '#4682b4',
    tan: '#d2b48c',
    teal: '#008080',
    thistle: '#d8bfd8',
    tomato: '#ff6347',
    turquoise: '#40e0d0',
    violet: '#ee82ee',
    wheat: '#f5deb3',
    white: '#ffffff',
    whitesmoke: '#f5f5f5',
    yellow: '#ffff00',
    yellowgreen: '#9acd32',
};

/**
 * A `#rrggbb` colour for a hex value or a CSS colour name, and black for anything else.
 * @deprecated Use `resolveColor()`, which says when a value is not a colour.
 */
export function parseColor(colorName: string): string {
    return resolveColor(colorName) ?? '#000000';
}

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const STROKES = {
    light: 1,
    regular: 2,
    bold: 3,
    1: 1,
    2: 2,
    3: 3,
} as const;

const STROKE_NAMES = { 1: 'light', 2: 'regular', 3: 'bold' } as const;

/**
 * A `#rrggbb` color for a hex value (`#0f0` or `#00ff00`) or a CSS color name. Null when the
 * value is neither, where `parseColor()` would give black.
 */
export function resolveColor(value: string): string | null {
    const trimmed = value.trim();
    const hex = HEX.exec(trimmed);

    if (hex) {
        const digits = hex[1].toLowerCase();
        return digits.length === 6
            ? `#${digits}`
            : `#${digits[0]}${digits[0]}${digits[1]}${digits[1]}${digits[2]}${digits[2]}`;
    }

    return COLORS[trimmed.toLowerCase()] ?? null;
}

/**
 * Parses a `colors` attribute into a colour map. Names are lower-cased, colours come out as
 * `#rrggbb`, and a pair whose colour is not a colour is left out.
 *
 * ```js
 * parseColors('primary:red, secondary:#0f0'); // { primary: '#ff0000', secondary: '#00ff00' }
 * ```
 */
export function parseColors(colors: string): ColorMap | undefined {
    if (!colors || typeof colors !== 'string') {
        return undefined;
    }

    const result: ColorMap = {};

    for (const pair of colors.split(',')) {
        const parts = pair.split(':').map((part) => part.trim());
        const color = parts.length === 2 && parts[0] ? resolveColor(parts[1]) : null;
        if (color) result[parts[0].toLowerCase()] = color;
    }

    return result;
}

/**
 * Writes a colour map the way `parseColors()` reads it, with every colour as `#rrggbb`.
 * Colours that are not colours are left out.
 *
 * ```js
 * formatColors({ primary: 'red', secondary: '#0f0' }); // 'primary:#ff0000,secondary:#00ff00'
 * ```
 */
export function formatColors(colors: ColorMap): string {
    return Object.entries(colors)
        .map(([name, value]) => [name, resolveColor(value)])
        .filter(([, value]) => value)
        .map(([name, value]) => `${name}:${value}`)
        .join(',');
}

/**
 * Parses a stroke attribute value to a supported numeric range.
 *
 * @param value Stroke value as a string or number ("light", 1, "1", "regular", 2, "2", "bold", 3, "3").
 * @returns Stroke value as 1, 2, or 3, or undefined if not valid.
 */
export function parseStroke(value: string | number): 1 | 2 | 3 | undefined {
    const key = typeof value === 'string' ? value.trim().toLowerCase() : value;
    return STROKES[key as keyof typeof STROKES];
}

/**
 * The name of a stroke width: 1, `'1'` and `'light'` give `'light'`. Null when the value is
 * not a stroke width.
 */
export function strokeName(value: string | number): 'light' | 'regular' | 'bold' | null {
    const stroke = parseStroke(value);
    return stroke ? STROKE_NAMES[stroke] : null;
}

/** @deprecated Returns a string as it is; nothing to parse. */
export function parseState(value: any): string | undefined {
    if (typeof value === 'string') {
        return value;
    }

    return undefined;
}
