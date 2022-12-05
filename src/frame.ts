import { cwd } from "node:process"

const generatorInstance = <T extends new (...args: any) => any>(classDeclarations: Map<any, any[]>, instancesMap: Map<any, any>, classDeclaration: T): T => {
    const prevInstance = instancesMap.get(classDeclaration)
    if (prevInstance) return prevInstance
    const classDeclarationArguments = classDeclarations.get(classDeclaration)
    if (!classDeclarationArguments) throw new Error(`Can't found Class declaration ${classDeclaration.name}`)
    const args: any[] = classDeclarationArguments.map(classDeclarationArgument => generatorInstance(classDeclarations, instancesMap, classDeclarationArgument))
    const instance = new classDeclaration(...args)
    instancesMap.set(classDeclaration, instance)
    return instance
}

class Context {
    constructor(
        private classDeclarations: Map<any, any[]> = new Map(),
        private instancesMap: Map<any, any> = new Map(),
    ) { }

    factory<T extends new (...args: any) => any>(C: T): T { return generatorInstance(this.classDeclarations, this.instancesMap, C) }
}

const loadGlobalClassDeclarations = (): Map<any, any[]> => {
    const locationModuleClassDeclarations = `${cwd()}/app.frame.ts`
    try {
        const { classDeclarations } = require(locationModuleClassDeclarations)
        return classDeclarations
    } catch {
        return new Map()
    }
}

export const createContext = () => {
    return new Context(loadGlobalClassDeclarations())
}

