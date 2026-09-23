import type { IconData } from './icon-data.ts';

/** A property driven by an expression: `k` is its value, `x` the expression. */
export interface ExpressionProperty {
    x: string;
    k: unknown;
    [key: string]: unknown;
}

function isObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object';
}

/** Every property whose expression contains `text`. */
export function findExpressions(data: unknown, text: string): ExpressionProperty[] {
    const found: ExpressionProperty[] = [];

    const visit = (value: Record<string, unknown>) => {
        for (const child of Object.values(value)) {
            if (isObject(child)) visit(child);
        }
        if (typeof value.x === 'string' && value.x.includes(text)) {
            found.push(value as ExpressionProperty);
        }
    };

    if (isObject(data)) visit(data);
    return found;
}

/** Removes every expression from the data, keeping the values. Changes `data` in place. */
export function removeExpressions(data: IconData): void {
    const strip = (value: unknown) => {
        if (!isObject(value)) return;
        if (typeof value.x === 'string') delete value.x;
        Object.values(value).forEach(strip);
    };

    strip(data);
}
