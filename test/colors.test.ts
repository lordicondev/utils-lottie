import { describe, expect, it } from 'vitest';
import {
    colorsByName,
    customizeIcon,
    defaultColors,
    formatColors,
    fromLottieColor,
    parseColors,
    resolveColor,
    toLottieColor,
} from '../src/index.ts';
import { icon } from './icons.ts';

describe('resolveColor', () => {
    it('reads hex values and CSS names, and says so when it cannot', () => {
        expect(resolveColor('#0F0')).toBe('#00ff00');
        expect(resolveColor(' #00ff00 ')).toBe('#00ff00');
        expect(resolveColor('IndianRed')).toBe('#cd5c5c');
        expect(resolveColor('mediumpurple')).toBe('#9370db');
        expect(resolveColor('nope')).toBeNull();
        expect(resolveColor('#12')).toBeNull();
    });
});

describe('Lottie colours', () => {
    it('goes between colours and Lottie colours', () => {
        expect(toLottieColor('#f00')).toEqual([1, 0, 0]);
        expect(toLottieColor('red')).toEqual([1, 0, 0]);
        expect(toLottieColor('#ff8000')).toEqual([1, 0.502, 0]);
        expect(toLottieColor('nope')).toBeNull();
        expect(fromLottieColor([1, 0, 0])).toBe('#ff0000');
        expect(fromLottieColor([1, 0, 0, 1])).toBe('#ff0000');
        expect(fromLottieColor(toLottieColor('#121331')!)).toBe('#121331');
        expect(fromLottieColor([1.2, -0.1, 0.5])).toBe('#ff0080');
    });
});

describe('colors attribute', () => {
    it('parses pairs, trimming and lower-casing names', () => {
        expect(parseColors('primary: red, Secondary:#0F0')).toEqual({
            primary: '#ff0000',
            secondary: '#00ff00',
        });
        expect(parseColors('primary:nope, secondary:red')).toEqual({ secondary: '#ff0000' });
    });

    it('gives null when nothing is left', () => {
        expect(parseColors('')).toBeNull();
        expect(parseColors('primary:nope')).toBeNull();
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

    it('takes the icon’s own colours instead of the icon', () => {
        const own = { primary: '#08A88A', secondary: 'rgb(0,0,0)' };
        expect(colorsByName(own, { '#08a88a': 'red', '#000': 'blue' })).toEqual({
            primary: '#ff0000',
        });
    });

    it('recolours a copy by the icon’s own colours, whatever their case or form', () => {
        const data = icon('lock');
        const colors = colorsByName(data, { '#121331': 'red', '#08A88A': '#00f', nope: 'blue' });
        const result = customizeIcon(data, { colors });

        expect(defaultColors(result)).toEqual({ primary: '#0000ff', secondary: '#ff0000' });
        expect(defaultColors(data)).toEqual({ primary: '#08a88a', secondary: '#121331' });
    });
});
