/** A marker: a named range of frames. Lordicon states are markers, `default:morph-select:0.5`. */
export interface LottieMarker {
    cm: string;
    tm: number;
    dr: number;
}

/** An effect on a layer. Lordicon keeps an icon's colours and stroke in these. */
export interface LottieEffect {
    nm: string;
    mn: string;
    ef?: { v?: { k?: unknown } }[];
}

export interface LottieLayer {
    nm?: string;
    ip: number;
    op: number;
    st: number;
    ef?: LottieEffect[];
}

export interface LottieAsset {
    id: string;
    nm?: string;
    layers?: LottieLayer[];
}

/** A colour as Lottie keeps it: `[r, g, b]` or `[r, g, b, a]`, each 0–1. */
export type LottieColor = [number, number, number] | [number, number, number, number];

/** A Lordicon icon file (Lottie JSON), as far as these utilities read it. */
export interface IconData {
    v?: string;
    fr: number;
    ip: number;
    op: number;
    w: number;
    h: number;
    layers: LottieLayer[];
    assets?: LottieAsset[];
    markers?: LottieMarker[];
}

/** True when `value` has what every Lottie file has: frame rate, in and out points, size, layers. */
export function isIconData(value: unknown): value is IconData {
    if (value === null || typeof value !== 'object') return false;

    const data = value as Record<string, unknown>;
    return (
        ['fr', 'ip', 'op', 'w', 'h'].every((key) => typeof data[key] === 'number') &&
        Array.isArray(data.layers)
    );
}
