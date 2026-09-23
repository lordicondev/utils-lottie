import {
    extractLottieProperties,
    get,
    resetLottieProperties,
    updateLottieProperties,
} from '../src';
import { loadIcon, preview } from './lib';

const data = await loadIcon('lock');
const properties = extractLottieProperties(data);
const table = document.getElementById('properties')!;
const container = document.getElementById('preview')!;

function show(): void {
    table.replaceChildren();

    for (const property of properties) {
        const row = document.createElement('tr');
        for (const cell of [
            property.name,
            property.type,
            JSON.stringify(get(data, property.path)),
            property.path,
        ]) {
            row.insertCell().textContent = cell;
        }
        table.append(row);
    }

    preview(container, data);
}

const named = (name: string) => properties.filter((property) => property.name === name);

document.getElementById('red')!.addEventListener('click', () => {
    updateLottieProperties(data, named('primary'), 'red');
    show();
});

document.getElementById('thin')!.addEventListener('click', () => {
    updateLottieProperties(data, named('stroke'), 1);
    show();
});

document.getElementById('reset')!.addEventListener('click', () => {
    resetLottieProperties(data, properties);
    show();
});

show();
