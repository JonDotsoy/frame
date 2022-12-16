import * as swc from "@swc/core"
import { parseFile, TsTypeAnnotation } from "@swc/core"
import { dirname } from "path"
import { Cache, cacheDefault } from "./dto/cache"
import { ShortDefinition } from "./short-definition"
import { RequireManager } from "./require-manager"
import { URLTransformer } from "./url-transformer"

export async function scanDeeps(
  fileLocationUrl: URLTransformer,
  cache: Cache = cacheDefault()
): Promise<Cache> {
  const requireManager = new RequireManager(fileLocationUrl.toDirname().toURL())
  const fileLocation = requireManager.resolveExpression(fileLocationUrl.toPath())
  if (!fileLocation) throw new Error(`Cannot found source ${fileLocationUrl}`)
  if (cache.has(fileLocation.toString())) return cache

  const program = await parseFile(fileLocation.toPath(), {
    syntax: "typescript",
    target: "es2022",
  })

  const shortModule: ShortDefinition.Module = {
    classes: {},
  }

  const importIdentifiers = new Map<string, ShortDefinition.Parameter>()

  for (const moduleItem of program.body) {
    if (moduleItem.type === "ImportDeclaration") {
      const validRequireModule = requireManager.resolveExpression(moduleItem.source.value)
      if (validRequireModule) {
        for (const specifier of moduleItem.specifiers) {
          if (specifier.type === "ImportSpecifier") {
            importIdentifiers.set(specifier.local.value, {
              exportName: specifier.imported?.value ?? specifier.local.value,
              module: validRequireModule,
            })
          }
          if (specifier.type === "ImportDefaultSpecifier") {
            importIdentifiers.set(specifier.local.value, {
              exportName: "default",
              module: validRequireModule,
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
            else if (param.type === "Parameter") {
              const pat = param.pat
              if (pat.type === "Identifier") {
                console.log(pat)
                const typeAnnotation: TsTypeAnnotation | undefined = Object.getOwnPropertyDescriptor(pat, "typeAnnotation")?.value
                if (typeAnnotation) {
                  const typeReference = typeAnnotation.typeAnnotation
                  if (typeReference.type === "TsTypeReference") {
                    const typeName = typeReference.typeName
                    if (typeName.type==="Identifier") {
                      const parameter = importIdentifiers.get(typeName.value)
                      if (parameter) {
                        shortClass.parameters.push(parameter)
                      }
                    }
                  }
                }
              }
            } else {
              throw new Error("Not parameter identifier")
            }
          }
        }

        shortModule.classes[shortClassName] = shortClass
      }
    }
  }

  cache.set(fileLocation.toString(), shortModule)

  for (const [_, parameter] of importIdentifiers) {
    await scanDeeps(parameter.module, cache)
  }

  return cache
}
