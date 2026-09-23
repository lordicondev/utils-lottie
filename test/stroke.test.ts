import { describe, expect, it } from 'vitest';
import { hasStroke, parseStroke, strokeName } from '../src';
import { icon } from './icons';

describe('stroke', () => {
    it('reads names and numbers', () => {
        expect(parseStroke('light')).toBe(1);
        expect(parseStroke(' Bold ')).toBe(3);
        expect(parseStroke(2)).toBe(2);
        expect(parseStroke('3')).toBe(3);
        expect(parseStroke('heavy')).toBeUndefined();
        expect(parseStroke(4)).toBeUndefined();
    });

    it('names a width', () => {
        expect(strokeName(1)).toBe('light');
        expect(strokeName('2')).toBe('regular');
        expect(strokeName('BOLD')).toBe('bold');
        expect(strokeName('heavy')).toBeNull();
    });

    it('tells whether an icon’s stroke can be changed, in either form', () => {
        expect(hasStroke(icon('lock'))).toBe(true); // `stroke`
        expect(hasStroke(icon('hourglass'))).toBe(true); // `stroke-layers`
        expect(hasStroke({ ...icon('lock'), layers: [] })).toBe(false);
    });
});
