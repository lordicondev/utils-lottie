import { describe, expect, it } from 'vitest';
import { isIconData } from '../src';
import { icon } from './icons';

describe('isIconData', () => {
    it('accepts a Lottie file', () => {
        expect(isIconData(icon('lock'))).toBe(true);
    });

    it('rejects anything without frame rate, points, size and layers', () => {
        expect(isIconData(null)).toBe(false);
        expect(isIconData('lock')).toBe(false);
        expect(isIconData({ fr: 60, ip: 0, op: 60, w: 430, h: 430 })).toBe(false);
        expect(isIconData({ fr: '60', ip: 0, op: 60, w: 430, h: 430, layers: [] })).toBe(false);
    });
});
