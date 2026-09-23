import { fromLottieColor, resolveColor } from './color.ts';
import { readControls } from './controls.ts';
import type { IconData } from './icon-data.ts';
import type { ColorMap } from './types.ts';

/**
 * Parses a `colors` attribute into a colour map. Names are lower-cased, colours come out as
 * `#rrggbb`, and a pair whose colour is not a colour is left out. Null when nothing is left.
 *
 * ```js
 * parseColors('primary:red, secondary:#0f0'); // { primary: '#ff0000', secondary: '#00ff00' }
 * ```
 */
export function parseColors(value: string): ColorMap | null {
    if (!value || typeof value !== 'string') return null;

    const colors: ColorMap = {};

    for (const pair of value.split(',')) {
        const parts = pair.split(':').map((part) => part.trim());
        const color = parts.length === 2 && parts[0] ? resolveColor(parts[1]) : null;
        if (color) colors[parts[0].toLowerCase()] = color;
    }

    return Object.keys(colors).length ? colors : null;
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

/** The icon's own colours, by name: `{ primary: '#121331', secondary: '#08a88a' }`. */
export function defaultColors(data: IconData): ColorMap {
    const colors: ColorMap = {};

    for (const control of readControls(data)) {
        if (control.type === 'color' && Array.isArray(control.value)) {
            colors[control.name] = fromLottieColor(control.value);
        }
    }

    return colors;
}

/**
 * The icon's colours to change, by name, from a map keyed by the icon's own colours:
 * `{ '#121331': 'red' }` gives `{ primary: '#ff0000' }` for an icon whose primary is
 * `#121331`. Takes the icon, or its own colours by name. Keys
 * and values may be any hex value or CSS colour name; pairs that are not colours are skipped.
 */
export function colorsByName(icon: IconData | ColorMap, colors: ColorMap): ColorMap {
    const byHex = new Map<string, string>();
    for (const [from, to] of Object.entries(colors)) {
        const key = resolveColor(from);
        const value = resolveColor(to);
        if (key && value) byHex.set(key, value);
    }

    const own = Array.isArray(icon.layers) ? defaultColors(icon as IconData) : (icon as ColorMap);
    const result: ColorMap = {};
    for (const [name, color] of Object.entries(own)) {
        const replacement = byHex.get(resolveColor(color) ?? '');
        if (replacement) result[name] = replacement;
    }

    return result;
}
