import {
    colorsByName,
    customizeIcon,
    defaultColors,
    formatColors,
    resolveColor,
} from '../src/index.ts';
import { loadIcon, preview } from './lib.ts';

// resolveColor
const input = document.querySelector<HTMLInputElement>('#value')!;
const resolved = document.getElementById('resolved')!;

function resolve(): void {
    const color = resolveColor(input.value);
    resolved.innerHTML = color
        ? `<span class="swatch" style="background:${color}"></span>${color}`
        : 'null: not a colour';
}

input.addEventListener('input', resolve);
resolve();

// Changing the icon's own colours
const data = await loadIcon('lock');
const own = defaultColors(data);
const chosen: Record<string, string> = {};
const pickers = document.getElementById('pickers')!;
const output = document.getElementById('output')!;
const container = document.getElementById('preview')!;

function update(): void {
    const byName = colorsByName(data, chosen);
    output.textContent = [
        `by the icon's colours: ${JSON.stringify(chosen)}`,
        `colorsByName():        ${JSON.stringify(byName)}`,
        `formatColors():        ${formatColors(byName)}`,
    ].join('\n');

    preview(container, customizeIcon(data, { colors: byName }));
}

for (const [name, hex] of Object.entries(own)) {
    const picker = document.createElement('input');
    picker.type = 'color';
    picker.value = hex;
    picker.addEventListener('input', () => {
        chosen[hex] = picker.value;
        update();
    });

    const label = document.createElement('label');
    label.append(`${name} `, picker);
    pickers.append(label);
}

update();
