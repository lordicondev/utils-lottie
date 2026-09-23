import { describe, expect, it } from 'vitest';
import {
    colorsByName,
    defaultColors,
    formatColors,
    hexToRgb,
    hexToTupleColor,
    parseColor,
    parseColors,
    remapColors,
    resolveColor,
    rgbToHex,
    tupleColorToHex,
} from '../src';
import { icon } from './icons';

describe('resolveColor', () => {
    it('reads hex values and CSS names, and says so when it cannot', () => {
        expect(resolveColor('#0F0')).toBe('#00ff00');
        expect(resolveColor(' #00ff00 ')).toBe('#00ff00');
        expect(resolveColor('IndianRed')).toBe('#cd5c5c');
        expect(resolveColor('mediumpurple')).toBe('#9370db');
        expect(resolveColor('nope')).toBeNull();
        expect(resolveColor('#12')).toBeNull();
    });

    it('has parseColor give black instead of null', () => {
        expect(parseColor('#F00')).toBe('#ff0000');
        expect(parseColor('#FF0000')).toBe('#ff0000');
        expect(parseColor('nope')).toBe('#000000');
        expect(parseColor('#12')).toBe('#000000');
    });
});

describe('conversions', () => {
    it('goes between hex, RGB and Lottie tuples', () => {
        expect(hexToRgb('#ff8000')).toEqual({ r: 255, g: 128, b: 0 });
        expect(hexToRgb('f80')).toEqual({ r: 255, g: 136, b: 0 });
        expect(rgbToHex({ r: 255, g: 128, b: 0 })).toBe('#ff8000');
        expect(hexToTupleColor('#f00')).toEqual([1, 0, 0]);
        expect(tupleColorToHex([1, 0, 0])).toBe('#ff0000');
        expect(tupleColorToHex(hexToTupleColor('#121331'))).toBe('#121331');
        expect(tupleColorToHex([1.2, -0.1, 0.5])).toBe('#ff0080');
    });
});

describe('colors attribute', () => {
    it('parses pairs, trimming and lower-casing names', () => {
        expect(parseColors('primary: red, Secondary:#0F0')).toEqual({
            primary: '#ff0000',
            secondary: '#00ff00',
        });
        expect(parseColors('primary:nope, secondary:red')).toEqual({ secondary: '#ff0000' });
        expect(parseColors('')).toBeUndefined();
    });

    it('writes a map back, leaving out what is not a colour', () => {
        expect(formatColors({ primary: 'red', secondary: '#0f0', tertiary: 'nope' })).toBe(
            'primary:#ff0000,secondary:#00ff00',
        );
        expect(parseColors(formatColors({ primary: 'tomato' }))).toEqual({ primary: '#ff6347' });
    });
});

describe('icon colours', () => {
    it('lists the icon’s own colours by name', () => {
        expect(defaultColors(icon('lock'))).toEqual({ primary: '#08a88a', secondary: '#121331' });
    });

    it('turns a map by the icon’s own colours into one by name', () => {
        expect(colorsByName(icon('lock'), { '#121331': 'red', '#08A88A': '#00f' })).toEqual({
            primary: '#0000ff',
            secondary: '#ff0000',
        });
        expect(colorsByName(icon('lock'), { '#abcdef': 'red', '#121331': 'nope' })).toEqual({});
    });

    it('remaps colours in the data, whatever the case or form of the colours', () => {
        const data = icon('lock');
        const result = remapColors(data, { '#121331': 'red', '#08A88A': '#00f', nope: 'blue' });

        expect(result).toBe(data);
        expect(defaultColors(data)).toEqual({ primary: '#0000ff', secondary: '#ff0000' });
    });
});
