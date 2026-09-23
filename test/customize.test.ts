import { describe, expect, it } from 'vitest';
import { customizeIcon, defaultColors, extractLottieProperties, readStates } from '../src';
import { icon } from './icons';

const stroke = (data: unknown) =>
    extractLottieProperties(data).find((p) => p.name === 'stroke' || p.name === 'stroke-layers')
        ?.value;
const layerNames = (data: { layers: { nm?: string }[] }) => data.layers.map((layer) => layer.nm);
const hasExpressions = (data: unknown) => /"x":"/.test(JSON.stringify(data));

describe('customizeIcon', () => {
    it('leaves the data it is given alone', () => {
        const data = icon('hourglass');
        const before = JSON.stringify(data);
        customizeIcon(data, { colors: { primary: 'red' }, stroke: 3, state: 'loop-spin' }, 'full');
        expect(JSON.stringify(data)).toBe(before);
    });

    it('sets colours by name, and skips values that are not colours', () => {
        const result = customizeIcon(icon('lock'), {
            colors: { primary: 'red', secondary: 'nope' },
        });
        expect(defaultColors(result)).toEqual({ primary: '#ff0000', secondary: '#121331' });
    });

    it('sets the stroke of either kind of icon', () => {
        expect(stroke(customizeIcon(icon('lock'), { stroke: 'bold' }))).toBe(3);
        expect(stroke(customizeIcon(icon('hourglass'), { stroke: 'light' }))).toBe(1);
    });

    it('makes a state the default one and keeps the other markers whole', () => {
        const result = customizeIcon(icon('morph-select'), { state: 'in-reveal' });
        expect(result.markers.map((marker: { cm: string }) => marker.cm)).toEqual([
            'default:in-reveal',
            'hover-pinch',
            'morph-select:0.5',
        ]);
    });

    it('changes nothing for a state the file does not have', () => {
        const data = icon('morph-select');
        const result = customizeIcon(data, { state: 'nope' });
        expect(result.markers).toEqual(data.markers);
        expect([result.ip, result.op]).toEqual([data.ip, data.op]);

        const minified = customizeIcon(data, { state: 'nope' }, 'full');
        expect(layerNames(minified)).toEqual(layerNames(data));
        expect(minified.markers).toHaveLength(3);
    });

    it('ends the file one frame after the state, so its last frame plays', () => {
        const result = customizeIcon(icon('morph-select'), { state: 'in-reveal' });
        // in-reveal is tm 0, dr 30: frames 0 to 30.
        expect([result.ip, result.op]).toEqual([0, 31]);
    });

    it('keeps only the chosen stroke with partial minify', () => {
        const result = customizeIcon(icon('hourglass'), { stroke: 3 }, 'partial');
        const names = layerNames(result);
        expect(names).toContain('control');
        expect(names.some((name) => name?.startsWith('light:'))).toBe(false);
        expect(names.some((name) => name?.startsWith('regular:'))).toBe(false);
        expect(names.filter((name) => name?.startsWith('bold:'))).toHaveLength(5);
    });

    it('keeps one state, from frame 0 and without expressions, with full minify', () => {
        const result = customizeIcon(icon('morph-select'), { state: 'morph-select' }, 'full');

        expect(readStates(result).map((s) => [s.name, s.time, s.duration, s.params])).toEqual([
            ['morph-select', 0, 60, ['0.5']],
        ]);
        expect([result.ip, result.op]).toEqual([0, 61]);
        expect(layerNames(result)).toEqual([
            'control',
            'light:morph-select:0.5',
            'regular:morph-select:0.5',
            'bold:morph-select:0.5',
        ]);
        expect(result.layers.slice(1).map((layer: { ip: number }) => layer.ip)).toEqual([0, 0, 0]);
        expect(hasExpressions(result)).toBe(false);
    });

    it('combines state and stroke with full minify', () => {
        const result = customizeIcon(icon('hourglass'), { state: 'loop-spin', stroke: 3 }, 'full');
        expect(layerNames(result)).toEqual(['control', 'bold:loop-spin']);
        expect([result.ip, result.op]).toEqual([0, 61]);
    });
});
