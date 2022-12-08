import { mkdir } from "fs/promises"
import { basename, dirname, extname, relative } from "path"
import { cwd } from "process"
import * as stacktrace from "stacktrace-js"
import { makeDeepFile } from "./lib/make-deepFile"
import { scanDeeps } from "./lib/scan-deeps"

export const factory = async <T>(C: new (...args: any) => T): Promise<T> => {
  const stacks = await stacktrace.get()
  const callBy = stacks.at(2)

  if (!callBy) throw new TypeError("Undeterminable origin")

  const fileName = callBy.getFileName()

  const callByFilenameExt = extname(fileName)
  const fileClassLocation = new URL(fileName, new URL(`${cwd()}/`, "file:///"))

  if (callByFilenameExt === ".js") {
    const fileDirname = dirname(fileClassLocation.pathname)
    const fileBasename = basename(fileClassLocation.pathname, callByFilenameExt)

    return require(`${fileDirname}/${fileBasename}`).ctx.get(C)
  }

  const keyword = relative(cwd(), fileClassLocation.pathname).replace(
    /\W/g,
    "_"
  )
  const fileOutLocationDirectory = new URL(
    ".tomy/",
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
