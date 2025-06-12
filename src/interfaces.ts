/**
 * Icon data in JSON format. This player is optimized to handle JSON (Lordicon Lottie) icons from [Lordicon Library](https://lordicon.com/).
 */
export type IconData = any;

/**
 * AnimationItem from lottie-web.
 */
export type AnimationItem = any;

/**
 * Lottie color type.
 */
export type LottieColor = [number, number, number];

/**
 * Supported field types.
 */
export type LottieFieldType = 'color' | 'slider' | 'point' | 'checkbox' | 'feature';

/**
 * Supported stroke values.
 */
export type Stroke = 1 | 2 | 3 | 'light' | 'regular' | 'bold';

/**
 * Interface for colors parameters.
 */
export interface IRGBColor {
    r: number;
    g: number;
    b: number;
}

/**
 * Interface for found property.
 */
export interface ILottieProperty {
    name: string;
    path: string;
    value: any;
    type: LottieFieldType;
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
export interface IColors {
    [key: string]: string;
}

/**
 * Interface for an object with customizable properties supported by {@link IPlayer | player}.
 * 
 * Notice: not every icon support all of that properties. This usually depends on the icon family.
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
export interface IProperties {
    /**
     * Stroke.
     */
    stroke?: Stroke;

    /**
     * State (motion type) of the icon. States allow switching between multiple animations built into a single icon file.
     */
    state?: string;

    /**
     * Colors.
     */
    colors?: IColors;
}

/**
 * Animation state details.
 */
export interface IState {
    name: string;
    time: number;
    duration: number;
    default?: boolean;
}
