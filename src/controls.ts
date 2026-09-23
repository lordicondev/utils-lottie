import { toLottieColor } from './color.ts';
import type { IconData, LottieColor } from './icon-data.ts';
import { setPath } from './path.ts';

/** The kinds of effect controls an icon may have. */
export type IconControlType = 'color' | 'slider' | 'point' | 'checkbox' | 'feature';

interface Control<Type extends IconControlType, Value> {
    /** The effect's name, lower-cased: `primary`, `stroke`. */
    name: string;
    type: Type;
    /** Where the value sits: in the data, or in a running animation. */
    path: string;
    /** The value in the data. */
    value: Value;
}

/**
 * An effect control on a layer. Lordicon keeps an icon's colours (`color`) and stroke
 * (`feature`) in these.
 */
export type IconControl =
    | Control<'color', LottieColor>
    | Control<'slider', number>
    | Control<'point', [number, number]>
    | Control<'checkbox', number>
    | Control<'feature', number>;

/** What `updateControls()` writes: a colour as hex, a name or a Lottie colour, a point as `[x, y]`, a number. */
export type ControlValue = string | number | number[];

const TYPES: Record<string, IconControlType> = {
    'ADBE Color Control': 'color',
    'ADBE Slider Control': 'slider',
    'ADBE Point Control': 'point',
    'ADBE Checkbox Control': 'checkbox',
};

function controlType(matchName: string): IconControlType | null {
    return TYPES[matchName] ?? (matchName.startsWith('Pseudo/') ? 'feature' : null);
}

/**
 * The icon's effect controls. With `{ renderer: true }` the paths point into a running
 * `@lordicon/internal` animation made from this data, for `updateControls(animation, ...)`.
 */
export function readControls(
    data: IconData,
    { renderer = false }: { renderer?: boolean } = {},
): IconControl[] {
    const controls: IconControl[] = [];
    if (!Array.isArray(data?.layers)) return controls;

    data.layers.forEach((layer, layerIndex) => {
        if (!layer?.nm || !Array.isArray(layer.ef)) return;

        layer.ef.forEach((effect, effectIndex) => {
            if (typeof effect?.mn !== 'string' || typeof effect.nm !== 'string') return;

            const type = controlType(effect.mn);
            const value = effect.ef?.[0]?.v?.k;
            if (!type || value === undefined) return;

            const path = renderer
                ? `renderer.elements.${layerIndex}.effectsManager.effectElements.${effectIndex}.effectElements.0.p.v`
                : `layers.${layerIndex}.ef.${effectIndex}.ef.0.v.k`;

            controls.push({ name: effect.nm.toLowerCase(), type, path, value } as IconControl);
        });
    });

    return controls;
}

/**
 * Writes `value` into each of `controls`, in `target`: the icon data, or the animation when
 * the controls were read with `{ renderer: true }`. A colour that is not a colour is skipped.
 */
export function updateControls(
    target: object,
    controls: readonly IconControl[],
    value: ControlValue,
): void {
    for (const control of controls) {
        if (control.type === 'color') {
            const color = typeof value === 'string' ? toLottieColor(value) : value;
            if (Array.isArray(color)) setPath(target, control.path, color);
        } else if (control.type === 'point') {
            if (Array.isArray(value)) {
                setPath(target, `${control.path}.0`, value[0]);
                setPath(target, `${control.path}.1`, value[1]);
            }
        } else {
            setPath(target, control.path, value);
        }
    }
}

/** Puts back the values `controls` had when they were read. */
export function resetControls(target: object, controls: readonly IconControl[]): void {
    for (const control of controls) {
        setPath(target, control.path, control.value);
    }
}
