import lottie from '@lordicon/internal';
import { defaultState, readStates, stateSegment, type IconData, type Segment } from '../src';

/** The icons in `examples/icons`. */
export const ICONS = ['lock', 'hourglass', 'money-bag', 'morph-select'];

export async function loadIcon(name: string): Promise<IconData> {
    const response = await fetch(`/icons/${name}.json`);
    return response.json();
}

/**
 * Shows an icon in `container`: a segment over and over, one frame, or by default its default
 * state (the file's own range when it has none). Frames are absolute: the file is opened from
 * frame 0 to the end of its last state.
 */
export function preview(
    container: HTMLElement,
    data: IconData,
    show: { segment?: Segment; frame?: number } = {},
): void {
    const states = readStates(data);
    const end = states.length ? stateSegment(states[states.length - 1])[1] : data.op;

    container.replaceChildren();
    const animation = lottie.loadAnimation({
        container,
        animationData: { ...structuredClone(data), ip: 0, op: Math.max(end, data.op) },
        loop: show.frame === undefined,
        autoplay: false,
    });

    if (show.frame !== undefined) animation.goToAndStop(show.frame, true);
    else {
        const resting = defaultState(states);
        const segment = show.segment ?? (resting ? stateSegment(resting) : [data.ip, data.op]);
        animation.playSegments(segment, true);
    }
}

/** A select with the example icons; calls `onChange` with the chosen one now and on change. */
export function iconPicker(select: HTMLSelectElement, onChange: (data: IconData) => void): void {
    for (const name of ICONS) select.append(new Option(name, name));

    const load = async () => onChange(await loadIcon(select.value));
    select.addEventListener('change', load);
    void load();
}

/** The size of the JSON, in kB. */
export function size(data: unknown): string {
    return `${(JSON.stringify(data).length / 1024).toFixed(1)} kB`;
}

export function download(name: string, data: unknown): void {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }));
    link.download = `${name}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
}

/** A tile: an icon over a caption. Returns the element to preview into. */
export function tile(parent: HTMLElement, caption: string): HTMLElement {
    const figure = document.createElement('figure');
    const icon = document.createElement('div');
    const label = document.createElement('figcaption');
    icon.className = 'icon';
    label.textContent = caption;
    figure.append(icon, label);
    parent.append(figure);
    return icon;
}
