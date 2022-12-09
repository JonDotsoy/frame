import { basename, dirname, relative } from "path"
import { writeFile } from "fs/promises"
import { Cache } from "./dto/cache"
import { LittleScript } from "./little-script"

export interface MakeDeepFileOptions {
  makeBootstrap?: boolean
}

export const makeDeepFile = async (
  outLocation: string,
  cache: Cache,
  options?: MakeDeepFileOptions
) => {
  const makeBootstrap = options?.makeBootstrap ?? false
  const program = new LittleScript.ProgramSentence()
  const deepsIdentifier = new LittleScript.IdentifierSentence("deeps")
  const setIdentifier = new LittleScript.IdentifierSentence("set")

  const importIdentifierSourceLocations = new Map<
    string,
    LittleScript.IdentifierSentence
  >()
  const importIdentifierNames = new Set<string>(["deeps", "ctx", "bootstrap"])

  const toImportIdentifier = (
    sourceLocation: string
  ): LittleScript.IdentifierSentence => {
    const importIdentifier = importIdentifierSourceLocations.get(sourceLocation)
    if (!importIdentifier)
      throw new Error(`Cannot found identifier to ${sourceLocation}`)
    return importIdentifier
  }

  const toRelativeSource = (sourceLocation: string) => {
    const _sourceRelativeLocation = relative(
      dirname(outLocation),
      sourceLocation
    )
    const __sourceRelativeLocation =
      _sourceRelativeLocation.startsWith("/") ||
      _sourceRelativeLocation.startsWith(".")
        ? _sourceRelativeLocation
        : `./${_sourceRelativeLocation}`
    const sourceRelativeLocation = __sourceRelativeLocation.endsWith(".ts")
      ? __sourceRelativeLocation.substring(
          0,
          __sourceRelativeLocation.length - 3
        )
      : __sourceRelativeLocation

    const sourceBasename = basename(sourceRelativeLocation).replace(/\W/g, "_")

    const eachName = (name: string): string => {
      let iter = 0
      let keyword = name

      while (importIdentifierNames.has(keyword)) {
        iter = iter + 1
        keyword = `${name}_${iter}`
      }

      return keyword
    }

    const keyword = eachName(sourceBasename)

    return { keyword, sourceRelativeLocation }
  }

  const appendResourceImport = (sourceLocation: string) => {
    const relativeSource = toRelativeSource(sourceLocation)
    const scriptIdentified = new LittleScript.IdentifierSentence(
      relativeSource.keyword
    )
    importIdentifierNames.add(relativeSource.keyword)
    importIdentifierSourceLocations.set(sourceLocation, scriptIdentified)

    program.append(
      new LittleScript.ImportSentence(
        scriptIdentified,
        relativeSource.sourceRelativeLocation
      )
    )

    return {
      relativeSource,
      scriptIdentified,
    }
  }

  // load tom
  const tomSourceLocation = require.resolve("../tom")
  const tomResourceImport = appendResourceImport(tomSourceLocation)
  const tomRelativeSource = tomResourceImport.relativeSource
  const tomScriptIdentified = tomResourceImport.scriptIdentified

  for (const [sourceLocation, module] of cache) {
    appendResourceImport(sourceLocation)
  }

  program.append(new LittleScript.LiteralSentence(""))

  program.append(
    new LittleScript.VariableSentence(
      "const",
      deepsIdentifier,
      new LittleScript.MapSentence(
        new LittleScript.IdentifierSentence("any"),
        new LittleScript.IdentifierSentence("any[]")
      )
    )
  )

  program.append(new LittleScript.LiteralSentence(""))

  for (const [sourceLocation, module] of cache) {
    const importIdentifier = toImportIdentifier(sourceLocation)

    for (const [className, { parameters }] of Object.entries(module.classes)) {
      program.append(
        new LittleScript.CallSentence(deepsIdentifier, setIdentifier, [
          new LittleScript.GetParamSentence(
            importIdentifier,
            new LittleScript.IdentifierSentence(className)
          ),
          new LittleScript.ArraySentence(
            parameters.map((parameter) => {
              return new LittleScript.GetParamSentence(
                toImportIdentifier(parameter.module),
                new LittleScript.IdentifierSentence(parameter.exportName)
              )
            })
          ),
        ])
      )
    }
  }

  program.append(new LittleScript.LiteralSentence(""))

  const ctxIdentifier = new LittleScript.IdentifierSentence("ctx")
  program.append(
    new LittleScript.ExportSentence(
      new LittleScript.VariableSentence(
        "const",
        ctxIdentifier,
        new LittleScript.CallSentence(
          tomScriptIdentified,
          new LittleScript.IdentifierSentence("createContext"),
          [deepsIdentifier]
        )
      )
    )
  )

  program.append(new LittleScript.LiteralSentence(""))

  if (makeBootstrap) {
    const inferClassApp = ():
      | { location: string; className: string }
      | undefined => {
      for (const [location, cacheItem] of cache.entries()) {
        for (const [classRef, ref] of Object.entries(cacheItem.classes)) {
          if (classRef.toLowerCase() === "app") {
            return {
              location,
              className: classRef,
            }
          }
        }
      }
    }

    const c = inferClassApp()
    if (!c) throw new Error("Not posible infer the class App")

    const bootstrapVariableIdentifier = new LittleScript.IdentifierSentence(
      "bootstrap"
    )
    const myAppVariableIdentifier = new LittleScript.IdentifierSentence("myApp")
    const newLocal_1 = new LittleScript.VariableSentence(
      "const",
      myAppVariableIdentifier,
      new LittleScript.AwaitSentence(
        new LittleScript.CallSentence(
          ctxIdentifier,
          new LittleScript.IdentifierSentence("get"),
          [
            new LittleScript.GetParamSentence(
              toImportIdentifier(c.location),
              new LittleScript.IdentifierSentence(c.className)
            ),
          ]
        )
      )
    )

    program.append(
      new LittleScript.AsyncFunctionSentence(
        bootstrapVariableIdentifier,
        [],
        new LittleScript.ProgramSentence([
          newLocal_1,
          new LittleScript.AwaitSentence(
            new LittleScript.CallSentence(
              myAppVariableIdentifier,
              new LittleScript.IdentifierSentence("run"),
              []
            )
          ),
        ])
      )
    )

    program.append(new LittleScript.LiteralSentence(""))

    program.append(
      new LittleScript.CallSentence(
        new LittleScript.CallSentence(null, bootstrapVariableIdentifier, []),
        new LittleScript.IdentifierSentence("catch"),
        [
          new LittleScript.GetParamSentence(
            new LittleScript.IdentifierSentence("console"),
            new LittleScript.IdentifierSentence("error")
          ),
        ]
      )
    )

    program.append(new LittleScript.LiteralSentence(""))
  }

  await writeFile(outLocation, program.toSource(), "utf-8")
}
