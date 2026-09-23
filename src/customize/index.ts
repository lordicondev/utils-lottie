import { readControls } from '../controls.ts';
import { removeExpressions } from '../expressions.ts';
import type { IconData } from '../icon-data.ts';
import { parseStroke } from '../stroke.ts';
import type { IconProperties } from '../types.ts';
import { assignColors } from './colors.ts';
import { assignState, hasState, removeOtherStates } from './state.ts';
import { assignStroke, removeOtherStrokes } from './stroke.ts';

export interface CustomizeOptions {
    /**
     * `partial` drops the layers of the other stroke widths. `full` also keeps only the
     * chosen state, moved to frame 0, and removes expressions.
     */
    minify?: 'partial' | 'full';
}

/**
 * A copy of the icon with the colours, stroke and default state baked in. `data` is left
 * alone. A state the file does not have changes nothing.
 */
export function customizeIcon<T extends IconData>(
    data: T,
    properties: IconProperties,
    { minify }: CustomizeOptions = {},
): T {
    const controls = readControls(data);
    const result = structuredClone(data);
    const width = properties.stroke ? parseStroke(properties.stroke) : null;
    const state = properties.state && hasState(data, properties.state) ? properties.state : null;

    if (width) assignStroke(result, controls, width);
    if (properties.colors) assignColors(result, controls, properties.colors);
    if (state) assignState(result, state);

    if ((minify === 'partial' || minify === 'full') && width) {
        removeOtherStrokes(result, width);
    }

    if (minify === 'full') {
        if (state) removeOtherStates(result, state);
        removeExpressions(result);
    }

    return result;
}
