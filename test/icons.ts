import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { IconData, IconState } from '../src/index.ts';

/**
 * Icons from the examples:
 * - lock: `stroke`, primary and secondary colours, states without a ratio
 * - hourglass: `stroke-layers`, with light, regular and bold layers
 * - morph-select: `in-reveal` [0, 61), `morph-select:0.5` [140, 201) split at 170; one stroke
 */
export function icon(name: 'lock' | 'hourglass' | 'money-bag' | 'morph-select'): IconData {
    const path = resolve(import.meta.dirname, '../examples/icons', `${name}.json`);
    return JSON.parse(readFileSync(path, 'utf8'));
}

export function state(
    name: string,
    time: number,
    duration: number,
    params: string[] = [],
): IconState {
    return { name, time, duration, params, default: false };
}
