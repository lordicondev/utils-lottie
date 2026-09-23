import {
    readStates,
    splitSegment,
    stateEndFrame,
    stateSegment,
    stateType,
    type IconData,
} from '../src/index.ts';
import { iconPicker, preview, tile } from './lib.ts';

const rows = document.getElementById('rows')!;

function show(data: IconData): void {
    rows.replaceChildren();

    for (const state of readStates(data)) {
        const row = document.createElement('div');
        row.className = 'tiles';
        rows.append(document.createElement('h3'), row);
        row.previousElementSibling!.textContent = `${state.name} (${stateType(state) ?? 'other'})`;

        const segment = stateSegment(state);
        preview(tile(row, `[${segment.join(', ')})`), data, { segment });

        const halves = splitSegment(state);
        if (halves) {
            preview(tile(row, `there [${halves[0].join(', ')})`), data, { segment: halves[0] });
            preview(tile(row, `back [${halves[1].join(', ')})`), data, { segment: halves[1] });
        }

        const end = stateEndFrame(state);
        preview(tile(row, `end frame ${end}`), data, { frame: end });
    }
}

iconPicker(document.querySelector<HTMLSelectElement>('#icon')!, show);
