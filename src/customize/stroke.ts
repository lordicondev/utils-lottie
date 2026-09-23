import { updateControls, type IconControl } from '../controls.ts';
import { findExpressions } from '../expressions.ts';
import type { IconData } from '../icon-data.ts';
import { strokeName } from '../stroke.ts';

const DIVISOR = /\$bm_div\(value,[ ]{0,}([0-9]+)\)/gm;

type Width = 1 | 2 | 3;

/**
 * Sets the stroke width. An icon with `stroke-layers` has a layer per width and shows one;
 * an icon with `stroke` scales its stroke values.
 */
export function assignStroke(data: IconData, controls: IconControl[], width: Width): void {
    const names = controls.map((control) => control.name);

    if (names.includes('stroke-layers')) {
        for (const each of [1, 2, 3]) {
            for (const property of findExpressions(
                data,
                `effect('stroke-layers')('Menu') == ${each}`,
            )) {
                property.k = each === width ? 100 : 0;
            }
        }
    } else if (names.includes('stroke')) {
        const current = controls.find((control) => control.name === 'stroke')?.value;
        const scale = typeof current === 'number' && current ? width / current : width;

        for (const property of findExpressions(data, `effect('stroke')('Menu')`)) {
            if (Array.isArray(property.k)) {
                for (const key of property.k) {
                    if (Array.isArray(key.s)) key.s = key.s.map((value: number) => value * scale);
                }
            } else {
                property.k = (property.k as number) * scale;
            }

            property.x = property.x.replace(DIVISOR, `$bm_div(value, ${width})`);
        }
    }

    updateControls(
        data,
        controls.filter((control) => control.name === 'stroke' || control.name === 'stroke-layers'),
        width,
    );
}

/** Drops the layers and assets of the other widths: `bold:in-reveal` goes unless bold is kept. */
export function removeOtherStrokes(data: IconData, width: Width): void {
    const keep = strokeName(width);
    const names = ['light', 'regular', 'bold'];
    const kept = (item: { nm?: unknown }) => {
        if (typeof item.nm !== 'string') return true;

        const [prefix] = item.nm.split(':');
        const variant = names.includes(prefix) && item.nm.includes(':');
        return !variant || prefix === keep;
    };

    data.layers = data.layers.filter(kept);
    if (Array.isArray(data.assets)) data.assets = data.assets.filter(kept);
}
