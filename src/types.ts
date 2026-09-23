/** A frame range `[start, end)`. The end is exclusive, as `setSegment()` takes it. */
export type Segment = [number, number];

/** A state of an icon, read from its marker: `default:morph-select:0.5`. */
export interface IconState {
    name: string;
    /** First frame, the marker's `tm`. */
    time: number;
    /** Length in frames, the marker's `dr`. The last frame is `time + duration`. */
    duration: number;
    /** What follows the name: `['0.5']` for `morph-select:0.5`. */
    params: string[];
    /** Marked `default:`. */
    default: boolean;
}

/** What kind of animation a state is, from its name: `morph-select` is a `morph`. */
export type StateType = 'in' | 'hover' | 'morph' | 'loop';

/** Colours by name: `{ primary: 'red', secondary: '#08a88a' }`. */
export interface ColorMap {
    [name: string]: string;
}

/** A stroke width, as a number or a name. */
export type Stroke = 1 | 2 | 3 | 'light' | 'regular' | 'bold';

/** What can be set on an icon: `{ state: 'hover-pinch', colors: { primary: 'red' }, stroke: 'bold' }`. */
export interface IconProperties {
    /** The state to play, or to make the default one. */
    state?: string;
    colors?: ColorMap;
    stroke?: Stroke;
}
