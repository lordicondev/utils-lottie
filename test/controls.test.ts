import { describe, expect, it } from 'vitest';
import {
    fromLottieColor,
    readControls,
    removeExpressions,
    resetControls,
    updateControls,
    type IconData,
    type LottieColor,
} from '../src/index.ts';
import { icon } from './icons.ts';

/** The value at a dotted path. */
const at = (object: unknown, path: string): unknown =>
    path.split('.').reduce((value, key) => (value as Record<string, unknown>)?.[key], object);

describe('controls', () => {
    it('reads colours and features with their paths and values', () => {
        const controls = readControls(icon('lock'));
        expect(controls.map((c) => [c.name, c.type, c.value])).toEqual([
            ['stroke', 'feature', 2],
            ['primary', 'color', [0.031372550875, 0.658823549747, 0.541176497936, 1]],
            ['secondary', 'color', [0.070588238537, 0.074509806931, 0.192156866193, 1]],
        ]);
        expect(controls[1].path).toMatch(/^layers\.\d+\.ef\.\d+\.ef\.0\.v\.k$/);
    });

    it('narrows the value by type', () => {
        const colors = readControls(icon('lock')).filter((c) => c.type === 'color');
        expect(colors.map((c) => fromLottieColor(c.value))).toEqual(['#08a88a', '#121331']);
    });

    it('gives renderer paths when asked', () => {
        const [first] = readControls(icon('lock'), { renderer: true });
        expect(first.path).toMatch(/^renderer\.elements\.\d+\.effectsManager/);
    });

    it('skips effects without a name or a match name', () => {
        const data = icon('lock');
        data.layers[0].ef!.push({ ef: [{ v: { k: 1 } }] } as never, { nm: 'x', ef: [] } as never);
        expect(readControls(data)).toHaveLength(3);
    });

    it('reads nothing from what is not an icon', () => {
        expect(readControls({} as IconData)).toEqual([]);
    });

    it('updates colours from a name, hex or a Lottie colour, and resets them', () => {
        const data = icon('lock');
        const controls = readControls(data);
        const primary = controls.filter((c) => c.name === 'primary');
        const read = () => fromLottieColor(at(data, primary[0].path) as LottieColor);

        updateControls(data, primary, 'red');
        expect(read()).toBe('#ff0000');
        updateControls(data, primary, '#00f');
        expect(read()).toBe('#0000ff');
        updateControls(data, primary, [0, 1, 0]);
        expect(read()).toBe('#00ff00');

        updateControls(data, primary, 'nope');
        expect(read()).toBe('#00ff00'); // not a colour: left as it was

        resetControls(data, controls);
        expect(read()).toBe('#08a88a');
    });

    it('updates numbers and points, and does nothing on a missing path', () => {
        const target = { a: { k: 1, p: [0, 0] } };
        updateControls(target, [{ name: 's', type: 'slider', path: 'a.k', value: 1 }], 5);
        updateControls(target, [{ name: 'p', type: 'point', path: 'a.p', value: [0, 0] }], [3, 4]);
        updateControls(target, [{ name: 'm', type: 'slider', path: 'x.y.z', value: 1 }], 5);
        expect(target).toEqual({ a: { k: 5, p: [3, 4] } });
    });
});

describe('removeExpressions', () => {
    it('drops every expression and leaves the values', () => {
        const data = { layers: [{ ks: { o: { k: 100, x: 'value * 2' } } }] } as unknown as IconData;
        removeExpressions(data);
        expect(data).toEqual({ layers: [{ ks: { o: { k: 100 } } }] });
    });
});
