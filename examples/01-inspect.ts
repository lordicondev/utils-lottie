import {
    defaultColors,
    hasStroke,
    isIconData,
    readStates,
    stateEndFrame,
    stateRatio,
    stateSegment,
    stateType,
    type IconData,
} from '../src';
import { iconPicker, preview, size, tile } from './lib';

const summary = document.getElementById('summary')!;
const rows = document.getElementById('states') as HTMLTableSectionElement;
const container = tile(document.getElementById('preview')!, 'the default state');

function inspect(data: unknown): void {
    rows.replaceChildren();
    container.replaceChildren();

    if (!isIconData(data)) {
        summary.textContent = 'Not a Lottie file: it needs fr, ip, op, w, h and layers.';
        return;
    }

    show(data);
}

function show(data: IconData): void {
    const colors = Object.entries(defaultColors(data))
        .map(([name, hex]) => `${name} ${hex}`)
        .join(', ');

    summary.textContent = [
        `${data.w} × ${data.h}, ${data.fr} fps, frames ${data.ip}–${data.op}, ${size(data)}`,
        `colours: ${colors || 'none'}`,
        `stroke can change: ${hasStroke(data) ? 'yes' : 'no'}`,
    ].join('\n');

    for (const state of readStates(data)) {
        const row = rows.insertRow();
        for (const cell of [
            state.name,
            stateType(state) ?? '—',
            state.default ? 'yes' : '',
            `[${stateSegment(state).join(', ')})`,
            stateRatio(state) ?? '',
            stateEndFrame(state),
        ]) {
            row.insertCell().textContent = String(cell);
        }
    }

    preview(container, data);
}

iconPicker(document.querySelector<HTMLSelectElement>('#icon')!, inspect);

document.getElementById('file')!.addEventListener('change', async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
        inspect(JSON.parse(await file.text()));
    } catch {
        summary.textContent = 'Not JSON.';
    }
});
