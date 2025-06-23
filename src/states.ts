import { IconState, LottieData } from "./interfaces.js";

/**
 * Supported state flags for icons.
 * Currently only 'default' is supported.
 */
const SUPPORTED_STATE_FLAGS = ['default'];

/**
 * Read states from lottie data.
 * @param data Lottie data to read states from.
 * @returns Array of icon states extracted from the data.
 */
export function readStates(
    data: LottieData,
): IconState[] {
    if (!data || !data.markers || !Array.isArray(data.markers)) {
        return [];
    }

    return data.markers.map((c: any) => {
        const parts: string[] = c.cm.split(':');

        const newState: IconState = {
            time: c.tm,
            duration: c.dr,
            name: '',
            default: false,
            params: [],
        };

        // Read state flags from the first part of the marker name.
        while (SUPPORTED_STATE_FLAGS.includes(parts[0])) {
            switch (parts[0]) {
                case 'default':
                    newState.default = true;
                    break;
                default:
                    throw new Error(`Unsupported state flag: ${parts[0]}`);
            }

            parts.shift();
        }

        // Parse state name and parameters from the remaining parts.
        newState.name = parts[0];
        newState.params = parts.slice(1, parts.length);

        return newState;
    });
}
