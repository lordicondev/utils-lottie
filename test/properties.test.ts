import { describe, expect, it } from 'vitest';
import {
    extractLottieProperties,
    get,
    has,
    removeExpressions,
    resetLottieProperties,
    set,
    tupleColorToHex,
    updateLottieProperties,
} from '../src';
import { icon } from './icons';

describe('properties', () => {
    it('extracts colours and features with their paths and values', () => {
        const properties = extractLottieProperties(icon('lock'));
        expect(properties.map((p) => [p.name, p.type])).toEqual([
            ['stroke', 'feature'],
            ['primary', 'color'],
            ['secondary', 'color'],
        ]);
        expect(properties[1].path).toMatch(/^layers\.\d+\.ef\.\d+\.ef\.0\.v\.k$/);
    });

    it('gives renderer paths when asked', () => {
        const [first] = extractLottieProperties(icon('lock'), { lottieInstance: true });
        expect(first.path).toMatch(/^renderer\.elements\.\d+\.effectsManager/);
    });

    it('skips effects without a name or a match name', () => {
        const data = icon('lock');
        data.layers[0].ef!.push({ ef: [{ v: { k: 1 } }] } as never, { nm: 'x', ef: [] } as never);
        expect(() => extractLottieProperties(data)).not.toThrow();
        expect(extractLottieProperties(data)).toHaveLength(3);
    });

    it('updates colours from a name, RGB or a tuple, and resets them', () => {
        const data = icon('lock');
        const properties = extractLottieProperties(data);
        const primary = properties.filter((p) => p.name === 'primary');
        const read = () => tupleColorToHex(get(data, primary[0].path));

        updateLottieProperties(data, primary, 'red');
        expect(read()).toBe('#ff0000');
        updateLottieProperties(data, primary, { r: 0, g: 0, b: 255 });
        expect(read()).toBe('#0000ff');
        updateLottieProperties(data, primary, [0, 1, 0]);
        expect(read()).toBe('#00ff00');

        updateLottieProperties(data, primary, 'nope');
        expect(read()).toBe('#00ff00'); // not a colour: left as it was

        resetLottieProperties(data, properties);
        expect(read()).toBe('#08a88a');
    });
});

describe('paths', () => {
    it('gets, checks and sets values', () => {
        const object = { a: { b: [1, 2] } };
        expect(get(object, 'a.b.1')).toBe(2);
        expect(get(object, 'a.c', 'none')).toBe('none');
        expect(has(object, ['a', 'b'])).toBe(true);
        expect(has(object, 'a.c')).toBe(false);

        set(object, 'a.b.0', 5);
        expect(object.a.b[0]).toBe(5);
    });

    it('does nothing when a step on the way is missing', () => {
        const object = { a: 1 };
        expect(() => set(object, 'x.y.z', 1)).not.toThrow();
        expect(() => set(object, 'a.b', 1)).not.toThrow();
        expect(object).toEqual({ a: 1 });
    });
});

describe('removeExpressions', () => {
    it('drops every expression and leaves the values', () => {
        const data = { layers: [{ ks: { o: { k: 100, x: 'value * 2' } } }] };
        removeExpressions(data);
        expect(data).toEqual({ layers: [{ ks: { o: { k: 100 } } }] });
    });
});
