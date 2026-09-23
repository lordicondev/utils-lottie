import type { IconState, LottieData } from './interfaces.js';

/**
 * Supported state flags for icons.
 * Currently only 'default' is supported.
 */
const SUPPORTED_STATE_FLAGS = ['default'];

/**
 * Read states from lottie data.
 * @param data Lottie data to read states from.
 * @returns Array of icon states extracted from the data.
 */
export function readStates(data: LottieData): IconState[] {
    if (!data || !data.markers || !Array.isArray(data.markers)) {
        return [];
    }

    const markers = data.markers.filter(
        (c: any) => typeof c?.cm === 'string' && typeof c.tm === 'number' && c.dr > 0,
    );

    return markers.map((c: any) => {
        const parts: string[] = c.cm.split(':');

        const newState: IconState = {
            time: c.tm,
            duration: c.dr,
            name: '',
            default: false,
            params: [],
        };

        // Read state flags from the first part of the marker name.
        while (SUPPORTED_STATE_FLAGS.includes(parts[0])) {
            switch (parts[0]) {
                case 'default':
                    newState.default = true;
                    break;
                default:
                    throw new Error(`Unsupported state flag: ${parts[0]}`);
            }

            parts.shift();
        }

        // Parse state name and parameters from the remaining parts.
        newState.name = parts[0];
        newState.params = parts.slice(1, parts.length);

        return newState;
    });
}

/** A frame range `[start, end)`. The end is exclusive, as `setSegment()` takes it. */
export type Segment = [number, number];

/** The frames of a state. `+ 1` keeps the state's last frame in the segment. */
export function stateSegment(state: IconState): Segment {
    return [state.time, state.time + state.duration + 1];
}

/**
 * The split ratio a morph marker carries: `morph-close:0.5` gives 0.5. Null without one, or
 * when it is not between 0 and 1 (both excluded).
 */
export function stateRatio(state: IconState): number | null {
    const ratio = state.params.length ? parseFloat(state.params[0]) : NaN;
    return ratio > 0 && ratio < 1 ? ratio : null;
}

/**
 * Splits a state in two at a ratio: the way to the second look, and the way back. `ratio`
 * overrides the one in the marker. Null when neither gives one between 0 and 1, or the state
 * is a single frame. Each half keeps at least one frame.
 */
export function splitSegment(state: IconState, ratio?: number): [Segment, Segment] | null {
    const at = ratio ?? stateRatio(state);
    if (at === null || !(at > 0 && at < 1)) {
        return null;
    }

    const [start, end] = stateSegment(state);
    if (end - start < 2) {
        return null;
    }

    const split = start + Math.floor((state.duration + 1) * at);
    const boundary = Math.min(Math.max(split, start + 1), end - 1);

    return [
        [start, boundary],
        [boundary, end],
    ];
}

/** The state with this exact name, or the first one whose name starts with it. */
export function findState(states: IconState[], name: string): IconState | null {
    return (
        states.find((state) => state.name === name) ??
        states.find((state) => state.name.startsWith(name)) ??
        null
    );
}

/** What kind of animation a state is, from its name: `morph-select` is a `morph`. */
export type StateType = 'in' | 'hover' | 'morph' | 'loop';

const STATE_TYPES: StateType[] = ['in', 'hover', 'morph', 'loop'];

/**
 * The kind of a state, from the prefix of its name: `in`, `hover`, `morph` or `loop`. Takes a
 * state or a name, with or without a `default:` flag. Null for any other prefix.
 */
export function stateType(state: IconState | string): StateType | null {
    const name = typeof state === 'string' ? state.replace(/^default:/, '') : state.name;
    const prefix = name.split('-')[0] as StateType;
    return STATE_TYPES.includes(prefix) ? prefix : null;
}

/**
 * The frame a state ends on: its last frame, or for a morph with a ratio the last frame of
 * the first half, where the icon holds its second look. `ratio` overrides the marker's.
 */
export function stateEndFrame(state: IconState, ratio?: number): number {
    const halves = splitSegment(state, ratio);
    return halves ? halves[0][1] - 1 : state.time + state.duration;
}

/** The state marked `default:`, or null. */
export function defaultState(states: IconState[]): IconState | null {
    return states.find((state) => state.default) ?? null;
}
