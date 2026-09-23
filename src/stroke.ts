import { readControls } from './controls.ts';
import type { IconData } from './icon-data.ts';

const WIDTHS: Record<string, 1 | 2 | 3> = { light: 1, regular: 2, bold: 3, 1: 1, 2: 2, 3: 3 };
const NAMES = { 1: 'light', 2: 'regular', 3: 'bold' } as const;

/** A stroke width as a number: `'light'`, `'1'` and 1 give 1. Null when it is not a width. */
export function parseStroke(value: string | number): 1 | 2 | 3 | null {
    const key = typeof value === 'string' ? value.trim().toLowerCase() : value;
    return WIDTHS[key] ?? null;
}

/** The name of a stroke width: 1, `'1'` and `'light'` give `'light'`. Null when it is not a width. */
export function strokeName(value: string | number): 'light' | 'regular' | 'bold' | null {
    const width = parseStroke(value);
    return width ? NAMES[width] : null;
}

/** True when the icon's stroke width can be changed: it has a `stroke` or `stroke-layers` control. */
export function hasStroke(data: IconData): boolean {
    return readControls(data).some(
        (control) => control.name === 'stroke' || control.name === 'stroke-layers',
    );
}
