import { COLOR_NAMES } from './color-names.ts';
import type { LottieColor } from './icon-data.ts';

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * A `#rrggbb` colour for a hex value (`#0f0` or `#00ff00`) or a CSS colour name. Null when the
 * value is neither.
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

    return COLOR_NAMES[trimmed.toLowerCase()] ?? null;
}

/** A colour as Lottie keeps it: `'#ff0000'` or `'red'` gives `[1, 0, 0]`. Null when it is not a colour. */
export function toLottieColor(value: string): [number, number, number] | null {
    const color = resolveColor(value);
    if (!color) return null;

    const rgb = parseInt(color.slice(1), 16);
    return [(rgb >> 16) & 255, (rgb >> 8) & 255, rgb & 255].map(
        (channel) => Math.round((channel / 255) * 1000) / 1000,
    ) as [number, number, number];
}

/** A Lottie colour as `#rrggbb`: `[1, 0, 0]` gives `'#ff0000'`. Values outside 0–1 are clamped; alpha is ignored. */
export function fromLottieColor(value: LottieColor): string {
    const hex = value
        .slice(0, 3)
        .map((channel) => Math.round(Math.min(Math.max(channel, 0), 1) * 255))
        .map((channel) => channel.toString(16).padStart(2, '0'));
    return `#${hex.join('')}`;
}
