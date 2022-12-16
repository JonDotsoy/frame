import { FrameError } from "./FrameError";

export const generatorInstance = <T>(
  deeps: Map<any, any[]>,
  instancesMap: Map<any, any>,
  classDeclaration: new (...args: any) => T
): T => {
  const prevInstance = instancesMap.get(classDeclaration);
  if (prevInstance)
    return prevInstance;
  const classDeclarationArguments = deeps.get(classDeclaration);
  if (!classDeclarationArguments)
    throw new FrameError(
      `Can't found class declaration ${classDeclaration.name}`
    );
  const args: any[] = classDeclarationArguments.map(
    (classDeclarationArgument) => generatorInstance(deeps, instancesMap, classDeclarationArgument)
  );
  const instance = new classDeclaration(...args);
  instancesMap.set(classDeclaration, instance);
  return instance;
};
