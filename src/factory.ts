import { debug } from "console"
import { existsSync } from "fs"
import { mkdir } from "fs/promises"
import { basename, dirname, extname, relative } from "path"
import { cwd } from "process"
import * as stacktrace from "stacktrace-js"
import { inspect } from "util"
import { Logger } from "./lib/logger"
import { makeDeepFile } from "./lib/make-deepFile"
import { scanDeeps } from "./lib/scan-deeps"

const logger = new Logger("tomts")

type FactoryOptions = {
  traceLevel?: number
}

export const factoryAndRun = async <T>(
  C: new (...args: any) => T,
  options?: FactoryOptions
): Promise<any> => {
  logger.log(`run factory to ${C.name}`)
  const instance = await factory(C, { traceLevel: 2, ...options })
  logger.log(`Result Factory: ${inspect(instance)}`)

  try {
    const isNameFunction = <K extends string>(
      item: any,
      prop: K
    ): item is Record<K, (...args: any) => any> =>
      typeof item === "object" &&
      item !== null &&
      typeof item[prop] === "function"
    if (isNameFunction(instance, "run")) return await instance.run()
    if (isNameFunction(instance, "main")) return await instance.main()
    if (isNameFunction(instance, "bootstrap")) return await instance.bootstrap()
    throw new Error(
      "Can't found some functions to run your app. You can choice `run()`, `main()` or `bootstrap()`"
    )
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}

export const factory = async <T>(
  C: new (...args: any) => T,
  options?: FactoryOptions
): Promise<T> => {
  const traceLevel = options?.traceLevel ?? 1
  const stacks = await stacktrace.get()
  const callBy = stacks.at(traceLevel)

  if (!callBy) throw new TypeError("Undeterminable origin")

  const fileName = callBy.getFileName()

  // const callByFilenameExt = extname(fileName)
  const fileClassLocation = new URL(fileName, new URL(`${cwd()}/`, "file:///"))

  const deepAltDirname = dirname(fileClassLocation.pathname)
  const deepAltExt = extname(fileClassLocation.pathname)
  const deepAltBasename = basename(fileClassLocation.pathname, deepAltExt)
  const deepAltShort = `${deepAltDirname}/${deepAltBasename}.deeps`
  const deepAlt = `${deepAltShort}${deepAltExt}`

  if (existsSync(deepAlt)) {
    return require(deepAltShort).ctx.get(C)
  }

  debug({
    deepAlt,
    deepAltDirname,
    deepAltExt,
    deepAltBasename,
    fileClassLocation,
  })

  const keyword = relative(cwd(), fileClassLocation.pathname).replace(
    /\W/g,
    "_"
  )
  const fileOutLocationDirectory = new URL(
    ".tom/",
    new URL(`${cwd()}/`, "file:///")
  )
  const fileOutLocation = new URL(`${keyword}.ts`, fileOutLocationDirectory)

  await mkdir(fileOutLocationDirectory, { recursive: true })
  const cache = await scanDeeps(fileClassLocation.pathname)
  await makeDeepFile(fileOutLocation.pathname, cache, {})

  const fileExt = extname(fileOutLocation.pathname)
  const fileDirname = dirname(fileOutLocation.pathname)
  const fileBasename = basename(fileOutLocation.pathname, fileExt)

  return require(`${fileDirname}/${fileBasename}`).ctx.get(C)
}
