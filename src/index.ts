// Types
export {
    isIconData,
    type IconData,
    type LottieAsset,
    type LottieColor,
    type LottieEffect,
    type LottieLayer,
    type LottieMarker,
} from './icon-data.ts';
export type { ColorMap, IconProperties, IconState, Segment, StateType, Stroke } from './types.ts';

// States
export {
    defaultState,
    findState,
    readStates,
    splitSegment,
    stateEndFrame,
    stateRatio,
    stateSegment,
    stateType,
} from './states.ts';

// Colours
export { fromLottieColor, resolveColor, toLottieColor } from './color.ts';
export { colorsByName, defaultColors, formatColors, parseColors } from './palette.ts';

// Stroke
export { hasStroke, parseStroke, strokeName } from './stroke.ts';

// A customised copy
export { customizeIcon, type CustomizeOptions } from './customize/index.ts';
export { removeExpressions } from './expressions.ts';

// Controls
export {
    readControls,
    resetControls,
    updateControls,
    type ControlValue,
    type IconControl,
    type IconControlType,
} from './controls.ts';
