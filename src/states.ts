import type { IconData } from './icon-data.ts';
import type { IconState, Segment, StateType } from './types.ts';

/** The icon's states, from its markers. Markers without a name or without frames are skipped. */
export function readStates(data: IconData): IconState[] {
    if (!Array.isArray(data?.markers)) return [];

    return data.markers
        .filter(
            (marker) =>
                typeof marker?.cm === 'string' && typeof marker.tm === 'number' && marker.dr > 0,
        )
        .map((marker) => {
            const parts = marker.cm.split(':');
            const state: IconState = {
                name: '',
                time: marker.tm,
                duration: marker.dr,
                params: [],
                default: false,
            };

            while (parts[0] === 'default') {
                state.default = true;
                parts.shift();
            }

            state.name = parts[0];
            state.params = parts.slice(1);
            return state;
        });
}

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
