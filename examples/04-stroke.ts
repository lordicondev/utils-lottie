import { customizeIcon, hasStroke, strokeName } from '../src/index.ts';
import { ICONS, loadIcon, preview, tile } from './lib.ts';

const rows = document.getElementById('rows')!;

for (const name of ICONS) {
    const data = await loadIcon(name);
    const heading = document.createElement('h3');
    const row = document.createElement('div');
    row.className = 'tiles';
    rows.append(heading, row);

    if (!hasStroke(data)) {
        heading.textContent = `${name}: no stroke setting`;
        continue;
    }

    heading.textContent = name;
    for (const stroke of [1, 2, 3] as const) {
        preview(tile(row, `${stroke}: ${strokeName(stroke)}`), customizeIcon(data, { stroke }));
    }
}
