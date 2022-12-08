import { cwd } from "process"
import { mkdir } from "fs/promises"
import { spawn } from "child_process"
import { scanDeeps } from "../../lib/scan-deeps"
import { makeDeepFile } from "../../lib/make-deepFile"
import { ArgsParsed } from "./ArgsParsed"
import { CmdHandler } from "./CmdHandler"

export class RunCmd implements CmdHandler {
  async cmdHandler(argsParsed: ArgsParsed): Promise<void> {
    const fileClassLocationArgument = argsParsed.positional(1)
    if (!fileClassLocationArgument)
      throw new TypeError(`Expected the <file-class> argument`)

    const fileClassLocation = new URL(
      fileClassLocationArgument,
      new URL(`${cwd()}/`, "file:///")
    )
    const fileOutLocationDirectory = new URL(
      ".tomy/",
      new URL(`${cwd()}/`, "file:///")
    )
    const fileOutLocation = new URL(".deeps.ts", fileOutLocationDirectory)

    await mkdir(fileOutLocationDirectory, { recursive: true })
    const cache = await scanDeeps(fileClassLocation.pathname)
    await makeDeepFile(fileOutLocation.pathname, cache, {
      makeBootstrap: true,
    })

    const childProcess = spawn("ts-node", [fileOutLocation.pathname], {
      stdio: "inherit",
    })
    await new Promise((resolve) => childProcess.once("close", resolve))
  }
}
