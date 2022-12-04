const isValidRestPath = (restApp: string[]): restApp is [string, ...string[]] => !!restApp.length

export const objectDeepAt = (obj: unknown, path: string, ...restPath: string[]): unknown => {
    if (obj === null || obj === undefined) return
    const propertyDescriptor = Object.getOwnPropertyDescriptor(obj, path)
    if (propertyDescriptor) {
        if (isValidRestPath(restPath)) {
            return objectDeepAt(propertyDescriptor.value, ...restPath)
        }
        return propertyDescriptor.value
    }
}

type TestFunction = (prop: string, obj: unknown, parent: unknown, locationPath: string[], root: unknown) => boolean
type PathTest = string | TestFunction

export const objectFindDeepAt = (obj: unknown, path: PathTest, ...restPath: PathTest[]) => {
    const root = obj
    const findDeepAt = (obj: unknown, restPath: PathTest[], finalPath: string[] = []): unknown[] => {
        if (!restPath.length && isValidRestPath(finalPath)) return [objectDeepAt(obj, ...finalPath)]
        const [path, ...nextRestPath] = restPath;
        if (typeof path === 'string') return findDeepAt(obj, nextRestPath, [...finalPath, path])
        if (typeof path === 'function' && isValidRestPath(finalPath)) {
            let r: unknown[] = []
            for (const [prop, propertyDescriptor] of Object.entries(Object.getOwnPropertyDescriptors(objectDeepAt(obj, ...finalPath)))) {
                const locationPath = [...finalPath, prop]
                if (path(prop, propertyDescriptor.value, obj, locationPath, root)) {
                    r = [...r, ...findDeepAt(obj, nextRestPath, locationPath)]
                }
            }
            return r;
        }
        return []
    }
    return findDeepAt(obj, [path, ...restPath])
}

export const objectFilterTree = <T = unknown>(obj: unknown, test: TestFunction): T[] => {
    const root = obj
    const r: T[] = []

    const each = (obj: unknown, locationPath: string[]) => {
        if (typeof obj === 'object' && obj !== null) {
            for (const [prop, propertyDescriptor] of Object.entries(Object.getOwnPropertyDescriptors(obj))) {
                const nextLocationPath = [...locationPath, prop]
                if (test(prop, propertyDescriptor.value, obj, nextLocationPath, root)) {
                    r.push(propertyDescriptor.value)
                }

                each(propertyDescriptor.value, nextLocationPath)
            }
        }
    }

    each(root, [])

    return r
}
