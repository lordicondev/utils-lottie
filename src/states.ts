import { IconState, LottieData } from "./interfaces.js";

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
        const [partA, partB] = c.cm.split(':');
        const newState: IconState = {
            time: c.tm,
            duration: c.dr,
            name: partB || partA,
            default: partB && partA.includes('default') ? true : false,
        };

        return newState;
    });
}
