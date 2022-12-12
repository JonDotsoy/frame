import * as swc from "@swc/core"
import { parseFile } from "@swc/core"
import { dirname } from "path"
import { Cache, cacheDefault } from "./dto/cache"
import { ShortDefinition } from "./short-definition"
import { RequireManager } from "./require-manager"

export async function scanDeeps(
  fileLocation: string,
  cache: Cache = cacheDefault()
): Promise<Cache> {
  const fileLocationUrl = new URL(`${dirname(fileLocation)}/`, "file://")
  const requireManager = new RequireManager(fileLocationUrl)

  if (cache.has(fileLocation)) return cache
  const program = await parseFile(fileLocation, {
    syntax: "typescript",
    target: "es2022",
  })

  const shortModule: ShortDefinition.Module = {
    classes: {},
  }

  const importIdentifiers = new Map<string, ShortDefinition.Parameter>()

  for (const moduleItem of program.body) {
    if (moduleItem.type === "ImportDeclaration") {
      const validRequireModule = /^[\.\/\\]/.test(moduleItem.source.value)
      if (validRequireModule) {
        let module = requireManager.resolve(
          new URL(moduleItem.source.value, fileLocationUrl)
        )
        for (const specifier of moduleItem.specifiers) {
          if (specifier.type === "ImportSpecifier") {
            importIdentifiers.set(specifier.local.value, {
              exportName: specifier.imported?.value ?? specifier.local.value,
              module: module.pathname,
            })
          }
          if (specifier.type === "ImportDefaultSpecifier") {
            importIdentifiers.set(specifier.local.value, {
              exportName: "default",
              module: module.pathname,
            })
          }
        }
      }
    }
    if (moduleItem.type === "ExportDeclaration") {
      const declaration = moduleItem.declaration

      if (declaration.type === "ClassDeclaration") {
        const shortClassName = declaration.identifier.value
        const shortClass: ShortDefinition.Class = {
          parameters: [],
        }
        const itemConstructor = declaration.body.find(
          (item) => item.type === "Constructor"
        ) as swc.Constructor | undefined
        if (itemConstructor) {
          for (const param of itemConstructor.params) {
            if (param.type === "TsParameterProperty") {
              const tsParamProperty = param.param
              if (tsParamProperty.type === "Identifier") {
                if (tsParamProperty.typeAnnotation) {
                  const typeAnnotation =
                    tsParamProperty.typeAnnotation.typeAnnotation
                  if (typeAnnotation.type == "TsTypeReference") {
                    const tsEntityName = typeAnnotation.typeName
                    if (tsEntityName.type === "Identifier") {
                      const parameter = importIdentifiers.get(
                        tsEntityName.value
                      )
                      if (parameter) {
                        shortClass.parameters.push(parameter)
                      }
                    }
                  }
                }
              }
            }
          }
        }

        shortModule.classes[shortClassName] = shortClass
      }
    }
  }

  cache.set(fileLocation, shortModule)

  for (const [_, parameter] of importIdentifiers) {
    await scanDeeps(parameter.module, cache)
  }

  return cache
}
