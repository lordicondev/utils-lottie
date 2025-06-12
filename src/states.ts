import { IState, IconData } from "./interfaces.js";

export function readStates(data: IconData): IState[] {
    return (data.markers || []).map((c: any) => {
        const [partA, partB] = c.cm.split(':');
        const newState: IState = {
            time: c.tm,
            duration: c.dr,
            name: partB || partA,
            default: partB && partA.includes('default') ? true : false,
        };

        return newState;
    });
}
