import { ColorsMap, IconProperties, LottieData, LottieProperty } from './interfaces';
import { extractLottieProperties, hexToTupleColor, updateLottieProperties } from './lottie';
import { parseColor, parseState, parseStroke } from './parsers';
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

    const keys = properties.map(c => c.name);

    // layers
    if (keys.includes('stroke-layers')) {
        const strokes = {
            1: findObject(data, `effect('stroke-layers')('Menu') == 1`),
            2: findObject(data, `effect('stroke-layers')('Menu') == 2`),
            3: findObject(data, `effect('stroke-layers')('Menu') == 3`),
        }

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
        const property = properties.filter(c => c.name === 'stroke')[0];
        const strokeObjects = findObject(data, `effect('stroke')('Menu')`);

        for (const s of strokeObjects) {
            const scale = (property && property.value) ? (stroke / property.value) : stroke;

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

function assignColors(data: LottieData, properties: LottieProperty[], value: ColorsMap) {
    for (const colorName of Object.keys(value)) {
        const color = parseColor(value[colorName]);
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

function assignState(data: LottieData, _properties: LottieProperty[], value: any) {
    const state = parseState(value);
    if (!state) {
        return;
    }

    for (const marker of data.markers || []) {
        const [partA, partB] = marker.cm.split(':');
        const name = partB || partA;

        marker.cm = name;

        if (name !== state) {
            continue;
        }

        marker.cm = `default:${name}`;
        data.ip = marker.tm;
        data.op = marker.tm + marker.dr;
    }
}

function removeOtherAnimations(data: LottieData, _properties: LottieProperty[], value: string) {
    const state = parseState(value);
    if (!state) {
        return;
    }

    // states
    const markers = (data.markers || []).map((c: any) => {
        const [partA, partB] = c.cm.split(':');
        const name = partB || partA;
        return name;
    })

    // remove redundant markers
    if (state && data.markers) {
        data.markers = data.markers.filter((c: any) => {
            const [partA, partB] = c.cm.split(':');
            const name = partB || partA;
            return name === state;
        });
    }

    // remove redundant layers 
    for (const key of ['assets', 'layers']) {
        data[key] = data[key].filter((c: any) => {
            const [partA, partB] = c.nm.split(':');
            const name = partB || partA;

            if (!markers.includes(name)) {
                return true;
            }

            return name === state ? true : false;
        });
    }

    // move animations to beginning
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
        data[key] = data[key].filter((c: any) => {
            const [partA, partB] = c.nm.split(':');

            if (partB && stroke && partA != (STROKES as any)[stroke]) {
                return false;
            }

            return true;
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
    }

    return newData;
}