import {
    customizeIcon,
    defaultColors,
    readStates,
    type IconData,
    type IconProperties,
    type Stroke,
} from '../src';
import { download, iconPicker, preview, size } from './lib';

const field = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const stateSelect = field<HTMLSelectElement>('state');
const strokeSelect = field<HTMLSelectElement>('stroke');
const primaryInput = field<HTMLInputElement>('primary');
const minifySelect = field<HTMLSelectElement>('minify');
const container = field<HTMLElement>('preview');
const output = field<HTMLElement>('output');

let data: IconData;
let result: IconData;

function build(): void {
    const properties: IconProperties = {};
    if (stateSelect.value) properties.state = stateSelect.value;
    if (strokeSelect.value) properties.stroke = strokeSelect.value as Stroke;
    if (primaryInput.value !== defaultColors(data).primary) {
        properties.colors = { primary: primaryInput.value };
    }

    const minify = (minifySelect.value || undefined) as 'partial' | 'full' | undefined;
    result = customizeIcon(data, properties, minify);

    output.textContent = [
        `customizeIcon(data, ${JSON.stringify(properties)}${minify ? `, '${minify}'` : ''})`,
        `${size(data)} → ${size(result)}`,
        `states: ${readStates(result)
            .map((state) => (state.default ? `${state.name} (default)` : state.name))
            .join(', ')}`,
        `frames ${result.ip}–${result.op}, layers ${result.layers.length}`,
    ].join('\n');

    preview(container, result);
}

iconPicker(field<HTMLSelectElement>('icon'), (icon) => {
    data = icon;
    stateSelect.replaceChildren(new Option('state as it is', ''));
    for (const state of readStates(data)) stateSelect.append(new Option(state.name, state.name));
    primaryInput.value = defaultColors(data).primary ?? '#000000';
    build();
});

for (const control of [stateSelect, strokeSelect, primaryInput, minifySelect]) {
    control.addEventListener('input', build);
}

field('download').addEventListener('click', () => download('icon', result));
