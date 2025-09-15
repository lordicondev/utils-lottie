/**
 * Icon data in JSON format.
 */
export type LottieData = any;

/**
 * AnimationItem from `@lordicon/internal`.
 */
export type LottieAnimationInstance = any;

/**
 * Supported property types.
 */
export type LottiePropertyType = 'color' | 'slider' | 'point' | 'checkbox' | 'feature';

/**
 * Interface for found property.
 */
export interface LottieProperty {
    name: string;
    path: string;
    type: LottiePropertyType;
    value: any;
}

/**
 * Supported stroke values.
 */
export type Stroke = 1 | 2 | 3 | 'light' | 'regular' | 'bold';

/**
 * Type for RGB color in Lottie format.
 */
export type RgbTuple = [number, number, number];

/**
 * Interface for colors parameters.
 */
export interface RgbColor {
    r: number;
    g: number;
    b: number;
}

/**
 * Interface for the object that stores multiple colors.
 * 
 * Example:
 * ```js
 * {
 *     primary: 'red',
 *     secondary: '#ff0000', 
 * }
 * ```
 */
export interface ColorMap {
    [key: string]: string;
}

/**
 * Interface for icon properties.
 * 
 * Example:
 * ```js
 * {
 *     stroke: 'bold',
 *     colors: {
 *         primary: 'red',
 *     },
 * }
 * ```
 */
export interface IconProperties {
    /**
     * State (motion type) of the icon. States allow switching between multiple animations built into a single icon file.
     */
    state?: string;

    /**
     * Colors.
     */
    colors?: ColorMap;

    /**
     * Stroke.
     */
    stroke?: Stroke;
}

/**
 * Animation state details.
 */
export interface IconState {
    name: string;
    time: number;
    duration: number;
    params: string[];
    default?: boolean;
}
