import type { ColorMap, IconProperties, LottieData, LottieProperty } from './interfaces';
import {
    extractLottieProperties,
    hexToTupleColor,
    removeExpressions,
    updateLottieProperties,
} from './lottie';
import { parseStroke, resolveColor } from './parsers';
import { deepClone, isObjectLike } from './utils';

function findObject(currentData: any, key: string) {
    const result: any[] = [];

    for (const k of Object.keys(currentData)) {
        const v = currentData[k];

        if (isObjectLike(v)) {
            result.push(...findObject(v, key));
        }
    }

    if (currentData.x && typeof currentData.x === 'string' && currentData.x.includes(key)) {
        result.push(currentData);
    }

    return result;
}

function assignStroke(data: LottieData, properties: LottieProperty[], value: any) {
    const stroke = parseStroke(value);
    if (!stroke) {
        return;
    }

    const keys = properties.map((c) => c.name);

    // layers
    if (keys.includes('stroke-layers')) {
        const strokes = {
            1: findObject(data, `effect('stroke-layers')('Menu') == 1`),
            2: findObject(data, `effect('stroke-layers')('Menu') == 2`),
            3: findObject(data, `effect('stroke-layers')('Menu') == 3`),
        };

        for (const k of [1, 2, 3]) {
            for (const s of (strokes as any)[k]) {
                if (k == stroke) {
                    s.k = 100;
                } else {
                    s.k = 0;
                }
            }
        }
    } else if (keys.includes('stroke')) {
        const regex = /\$bm_div\(value,[ ]{0,}([0-9]+)\)/gm;
        const property = properties.filter((c) => c.name === 'stroke')[0];
        const strokeObjects = findObject(data, `effect('stroke')('Menu')`);

        for (const s of strokeObjects) {
            const scale = property && property.value ? stroke / property.value : stroke;

            if (isObjectLike(s.k) && Array.isArray(s.k)) {
                for (const l of s.k) {
                    if (Array.isArray(l.s)) {
                        l.s = l.s.map((cc: number) => cc * scale);
                    }
                }
            } else {
                s.k = s.k * scale;
            }

            // update expression
            s.x = s.x.replace(regex, `$bm_div(value, ${stroke})`);
        }
    }

    // properties
    for (const p of properties) {
        if (p.name === 'stroke' || p.name === 'stroke-layers') {
            updateLottieProperties(data, [p], stroke);
        }
    }
}

function assignColors(data: LottieData, properties: LottieProperty[], value: ColorMap) {
    for (const colorName of Object.keys(value)) {
        const color = resolveColor(value[colorName]);
        if (!color) continue;
        const colorObjects = findObject(data, `effect('${colorName}')('Color')`);

        // layers
        for (const s of colorObjects) {
            s.k = [...hexToTupleColor(color), 1];
        }

        // properties
        for (const p of properties) {
            if (p.name === colorName) {
                updateLottieProperties(data, [p], color);
            }
        }
    }
}

/** The state a marker names: `default:morph-select:0.5` gives `morph-select`. */
function markerState(cm: string): string {
    const parts = cm.split(':');
    if (parts[0] === 'default') parts.shift();
    return parts[0];
}

/** The state a layer or asset belongs to: `bold:morph-select:0.5` gives `morph-select`. */
function layerState(nm: unknown): string | null {
    if (typeof nm !== 'string') return null;

    const parts = nm.split(':');
    if (parts.length > 1 && ['light', 'regular', 'bold'].includes(parts[0])) parts.shift();
    return parts[0];
}

/** The state `value` names, when the file has it. */
function knownState(data: LottieData, value: unknown): string | null {
    if (typeof value !== 'string') return null;

    const markers: { cm?: unknown }[] = data.markers || [];
    const found = markers.some(
        (marker) => typeof marker.cm === 'string' && markerState(marker.cm) === value,
    );
    return found ? value : null;
}

/**
 * Makes `value` the default state and narrows the file to it. Other markers keep their
 * params. A state the file does not have changes nothing.
 */
function assignState(data: LottieData, _properties: LottieProperty[], value: any) {
    const state = knownState(data, value);
    if (!state) {
        return;
    }

    for (const marker of data.markers || []) {
        const parts = marker.cm.split(':');
        if (parts[0] === 'default') {
            parts.shift();
        }

        if (parts[0] !== state) {
            marker.cm = parts.join(':');
            continue;
        }

        marker.cm = ['default', ...parts].join(':');

        // The state's last frame is tm + dr; op is the first frame after it.
        data.ip = marker.tm;
        data.op = marker.tm + marker.dr + 1;
    }
}

function removeOtherAnimations(data: LottieData, _properties: LottieProperty[], value: string) {
    const state = knownState(data, value);
    if (!state) {
        return;
    }

    const states = (data.markers || []).map((marker: any) => markerState(marker.cm));

    if (data.markers) {
        data.markers = data.markers.filter((marker: any) => markerState(marker.cm) === state);
    }

    // Layers and assets of other states go; the rest (the control layer) stays.
    for (const key of ['assets', 'layers']) {
        if (!Array.isArray(data[key])) continue;

        data[key] = data[key].filter((item: any) => {
            const name = layerState(item.nm);
            return name === null || !states.includes(name) || name === state;
        });
    }

    // Move the state to the start of the file.
    const start = data.ip;

    data.ip = 0;
    data.op = data.op - start;

    for (const marker of data.markers || []) {
        marker.tm = marker.tm - start;
    }

    for (const layer of data.layers || []) {
        if (layer.ip >= start) {
            layer.ip = layer.ip - start;
            layer.st = layer.st - start;
            layer.op = layer.op - start;
        }
    }
}

function removeOtherStrokes(data: LottieData, properties: LottieProperty[], value: any) {
    const stroke = parseStroke(value);
    if (!stroke) {
        return;
    }

    const STROKES = {
        1: 'light',
        2: 'regular',
        3: 'bold',
    };

    // remove redundant layers
    for (const key of ['assets', 'layers']) {
        if (!Array.isArray(data[key])) continue;

        // `bold:in-reveal` is the bold variant; a name without a stroke prefix stays.
        data[key] = data[key].filter((c: any) => {
            if (typeof c.nm !== 'string') return true;

            const [prefix] = c.nm.split(':');
            const variant = Object.values(STROKES).includes(prefix) && c.nm.includes(':');
            return !variant || prefix === (STROKES as any)[stroke];
        });
    }

    // properties
    for (const p of properties) {
        if (p.name === 'stroke' || p.name === 'stroke-layers') {
            // updateProperties(data, [p], 0);
        }
    }
}

/**
 * Create new customized icon data.
 * @param data Original Lottie data.
 * @param assign Icon properties to assign.
 * @param params Additional parameters.
 * @returns Customized Lottie data.
 */
export function customizeIcon(
    data: LottieData,
    assign: IconProperties,
    minify?: 'full' | 'partial',
): LottieData {
    const properties = extractLottieProperties(data);
    const newData = deepClone(data);

    if (assign.stroke) {
        assignStroke(newData, properties, assign.stroke);
    }

    if (assign.colors) {
        assignColors(newData, properties, assign.colors);
    }

    if (assign.state) {
        assignState(newData, properties, assign.state);
    }

    if (minify === 'partial' || minify === 'full') {
        if (assign.stroke) {
            removeOtherStrokes(newData, properties, assign.stroke);
        }
    }

    if (minify === 'full') {
        if (assign.state) {
            removeOtherAnimations(newData, properties, assign.state);
        }

        removeExpressions(newData);
    }

    return newData;
}
