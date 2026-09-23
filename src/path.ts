function isObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object';
}

/** Sets the value at a dotted path. Does nothing when a step on the way is missing. */
export function setPath(object: object, path: string, value: unknown): void {
    const keys = path.split('.');
    let current: unknown = object;

    for (const key of keys.slice(0, -1)) {
        if (!isObject(current)) return;
        current = current[key];
    }

    if (isObject(current)) current[keys[keys.length - 1]] = value;
}
