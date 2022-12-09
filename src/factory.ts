import { debug } from "console"
import { existsSync } from "fs"
import { mkdir } from "fs/promises"
import { basename, dirname, extname, relative } from "path"
import { cwd } from "process"
import * as stacktrace from "stacktrace-js"
import { makeDeepFile } from "./lib/make-deepFile"
import { scanDeeps } from "./lib/scan-deeps"

export const factory = async <T>(C: new (...args: any) => T): Promise<T> => {
  const stacks = await stacktrace.get()
  const callBy = stacks.at(1)

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
