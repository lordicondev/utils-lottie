import type { IconData } from '../icon-data.ts';

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

/** True when the file has a state of this name. */
export function hasState(data: IconData, state: string): boolean {
    return (data.markers ?? []).some(
        (marker) => typeof marker.cm === 'string' && markerState(marker.cm) === state,
    );
}

/** Makes `state` the default one and narrows the file to its frames. Other markers keep their params. */
export function assignState(data: IconData, state: string): void {
    for (const marker of data.markers ?? []) {
        const parts = marker.cm.split(':');
        if (parts[0] === 'default') parts.shift();

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

/** Keeps only `state`: its marker, layers and assets, moved to frame 0. */
export function removeOtherStates(data: IconData, state: string): void {
    const states = (data.markers ?? []).map((marker) => markerState(marker.cm));

    if (data.markers) {
        data.markers = data.markers.filter((marker) => markerState(marker.cm) === state);
    }

    // Layers and assets of other states go; the rest (the control layer) stays.
    const kept = (item: { nm?: unknown }) => {
        const name = layerState(item.nm);
        return name === null || !states.includes(name) || name === state;
    };
    data.layers = data.layers.filter(kept);
    if (Array.isArray(data.assets)) data.assets = data.assets.filter(kept);

    const start = data.ip;
    data.ip = 0;
    data.op = data.op - start;

    for (const marker of data.markers ?? []) {
        marker.tm = marker.tm - start;
    }

    for (const layer of data.layers) {
        if (layer.ip >= start) {
            layer.ip = layer.ip - start;
            layer.st = layer.st - start;
            layer.op = layer.op - start;
        }
    }
}
