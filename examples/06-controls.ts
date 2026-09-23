import { readControls, resetControls, updateControls } from '../src/index.ts';
import { loadIcon, preview } from './lib.ts';

const data = await loadIcon('lock');
const controls = readControls(data);
const table = document.getElementById('controls')!;
const container = document.getElementById('preview')!;

/** The value at a dotted path, to show what the data holds now. */
const at = (object: unknown, path: string): unknown =>
    path.split('.').reduce((value, key) => (value as Record<string, unknown>)?.[key], object);

function show(): void {
    table.replaceChildren();

    for (const control of controls) {
        const row = document.createElement('tr');
        for (const cell of [
            control.name,
            control.type,
            JSON.stringify(at(data, control.path)),
            control.path,
        ]) {
            row.insertCell().textContent = cell;
        }
        table.append(row);
    }

    preview(container, data);
}

const named = (name: string) => controls.filter((control) => control.name === name);

document.getElementById('red')!.addEventListener('click', () => {
    updateControls(data, named('primary'), 'red');
    show();
});

document.getElementById('thin')!.addEventListener('click', () => {
    updateControls(data, named('stroke'), 1);
    show();
});

document.getElementById('reset')!.addEventListener('click', () => {
    resetControls(data, controls);
    show();
});

show();
