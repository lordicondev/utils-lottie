import { describe, expect, it } from 'vitest';
import {
    defaultState,
    findState,
    readStates,
    splitSegment,
    stateEndFrame,
    stateRatio,
    stateSegment,
    stateType,
} from '../src/index.ts';
import { icon, state } from './icons.ts';

const morph = state('morph-select', 100, 60, ['0.5']);

describe('readStates', () => {
    it('reads the markers: name, flags, params', () => {
        const states = readStates(icon('morph-select'));
        expect(states.map((s) => [s.name, s.default, s.params])).toEqual([
            ['in-reveal', false, []],
            ['hover-pinch', true, []],
            ['morph-select', false, ['0.5']],
        ]);
    });

    it('skips markers without a name or without frames', () => {
        const states = readStates({
            ...icon('lock'),
            markers: [
                { tm: 0, dr: 10 } as never,
                { cm: 'empty', tm: 0, dr: 0 },
                { cm: 'in-reveal', tm: 0, dr: 30 },
            ],
        });
        expect(states.map((s) => s.name)).toEqual(['in-reveal']);
    });

    it('is empty for data without markers', () => {
        expect(readStates({ ...icon('lock'), markers: undefined })).toEqual([]);
        expect(readStates(null as never)).toEqual([]);
    });
});

describe('segments', () => {
    it('turns a state into a segment with its last frame in', () => {
        expect(stateSegment(morph)).toEqual([100, 161]);
    });

    it('reads the ratio from the marker', () => {
        expect(stateRatio(morph)).toBe(0.5);
        expect(stateRatio(state('a', 0, 10))).toBeNull();
        expect(stateRatio(state('a', 0, 10, ['nope']))).toBeNull();
        expect(stateRatio(state('a', 0, 10, ['1.5']))).toBeNull();
        expect(stateRatio(state('a', 0, 10, ['1']))).toBeNull();
        expect(stateRatio(state('a', 0, 10, ['0']))).toBeNull();
    });

    it('splits a segment at the ratio, or at one given', () => {
        expect(splitSegment(morph)).toEqual([
            [100, 130],
            [130, 161],
        ]);
        expect(splitSegment(morph, 0.25)).toEqual([
            [100, 115],
            [115, 161],
        ]);
        expect(splitSegment(state('a', 0, 10))).toBeNull();
    });

    it('refuses a ratio of 1 or more, and keeps a frame in each half', () => {
        expect(splitSegment(morph, 1)).toBeNull();
        expect(splitSegment(morph, 1.5)).toBeNull();
        expect(splitSegment(morph, 0)).toBeNull();
        expect(splitSegment(morph, 0.001)).toEqual([
            [100, 101],
            [101, 161],
        ]);
        expect(splitSegment(state('a', 0, 0), 0.5)).toBeNull();
        expect(splitSegment(state('a', 0, 1), 0.99)).toEqual([
            [0, 1],
            [1, 2],
        ]);
    });

    it('starts the way back on a frame of its own, as icons are drawn', () => {
        // morph-select:0.5 over [140, 201): the way back is keyed from 170, and many icons cut
        // there (a layer swapped, a crack appearing), so the way there ends on 169.
        const morphSelect = findState(readStates(icon('morph-select')), 'morph-select')!;
        expect(splitSegment(morphSelect)).toEqual([
            [140, 170],
            [170, 201],
        ]);
        expect(stateEndFrame(morphSelect)).toBe(169);
    });

    it('finds the frame a state ends on', () => {
        expect(stateEndFrame(state('in-reveal', 0, 30))).toBe(30);
        // A morph holds its second look at the end of the first half.
        expect(stateEndFrame(morph)).toBe(129);
        expect(stateEndFrame(morph, 0.25)).toBe(114);
    });
});

describe('lookup', () => {
    it('finds a state by name or prefix, and the default one', () => {
        const states = readStates(icon('lock'));
        expect(findState(states, 'morph-unlocked')?.time).toBe(200);
        expect(findState(states, 'hover')?.name).toBe('hover-locked');
        expect(findState(states, 'loop')).toBeNull();
        expect(defaultState(states)?.name).toBe('hover-locked');
        expect(defaultState([])).toBeNull();
    });

    it('tells the kind of a state from its name', () => {
        expect(stateType('in-reveal')).toBe('in');
        expect(stateType('default:hover-pinch')).toBe('hover');
        expect(stateType(morph)).toBe('morph');
        expect(stateType('loop-spin')).toBe('loop');
        expect(stateType('rotation')).toBeNull();
        expect(stateType('')).toBeNull();
    });
});
