import { describe, expect, it } from 'vitest';
import { customizeIcon, isIconData, readStates } from '../src/index.ts';
import { icon } from './icons.ts';

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

describe('IconData', () => {
    it('takes a type of your own that has the fields', () => {
        // An interface gets no implicit index signature; IconData must not need one.
        interface MyLottie {
            nm: string;
            fr: number;
            ip: number;
            op: number;
            w: number;
            h: number;
            layers: { nm: string; ip: number; op: number; st: number; ks: object }[];
        }
        const data: MyLottie = { ...icon('lock'), nm: 'lock' } as MyLottie;
        const copy: MyLottie = customizeIcon(data, { stroke: 1 });
        expect(copy.nm).toBe('lock');
        expect(readStates(data).length).toBeGreaterThan(0);
    });
});
