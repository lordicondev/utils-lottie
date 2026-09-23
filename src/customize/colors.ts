import { resolveColor, toLottieColor } from '../color.ts';
import { updateControls, type IconControl } from '../controls.ts';
import { findExpressions } from '../expressions.ts';
import type { IconData } from '../icon-data.ts';
import type { ColorMap } from '../types.ts';

/** Sets colours by name, in the controls and in the expressions that read them. */
export function assignColors(data: IconData, controls: IconControl[], colors: ColorMap): void {
    for (const [name, value] of Object.entries(colors)) {
        const color = resolveColor(value);
        if (!color) continue;

        for (const property of findExpressions(data, `effect('${name}')('Color')`)) {
            property.k = [...toLottieColor(color)!, 1];
        }

        updateControls(
            data,
            controls.filter((control) => control.name === name),
            color,
        );
    }
}
