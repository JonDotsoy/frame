export class FrameError extends Error {}

const generatorInstance = <T>(
  deeps: Map<any, any[]>,
  instancesMap: Map<any, any>,
  classDeclaration: new (...args: any) => T
): T => {
  const prevInstance = instancesMap.get(classDeclaration)
  if (prevInstance) return prevInstance
  const classDeclarationArguments = deeps.get(classDeclaration)
  if (!classDeclarationArguments)
    throw new FrameError(
      `Can't found class declaration ${classDeclaration.name}`
    )
  const args: any[] = classDeclarationArguments.map(
    (classDeclarationArgument) =>
      generatorInstance(deeps, instancesMap, classDeclarationArgument)
  )
  const instance = new classDeclaration(...args)
  instancesMap.set(classDeclaration, instance)
  return instance
}

export class Context {
  constructor(
    private deeps: Map<any, any[]> = new Map(),
    private instancesMap: Map<any, any> = new Map()
  ) {}

  get<T>(C: new (...args: any) => T): T {
    return generatorInstance(this.deeps, this.instancesMap, C)
  }
}

export const createContext = (deeps: Map<any, any[]>) => {
  return new Context(deeps)
}
