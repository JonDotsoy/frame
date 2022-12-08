import { cwd } from "process"
import { scanDeeps } from "../../lib/scan-deeps"
import { makeDeepFile } from "../../lib/make-deepFile"
import { ArgsParsed } from "./ArgsParsed"
import { CmdHandler } from "./CmdHandler"

export class CompileCmd implements CmdHandler {
  async cmdHandler(argsParsed: ArgsParsed) {
    const fileClassLocationArgument = argsParsed.positional(1)
    if (!fileClassLocationArgument)
      throw new TypeError(`Expected the <file-class> argument`)

    const fileOutLocationArgument = argsParsed.positional(2)
    if (!fileOutLocationArgument)
      throw new TypeError(`Expected the <file-deeps-out> argument`)

    const fileClassLocation = new URL(
      fileClassLocationArgument,
      new URL(`${cwd()}/`, "file:///")
    )
    const fileOutLocation = new URL(
      fileOutLocationArgument,
      new URL(`${cwd()}/`, "file:///")
    )

    const cache = await scanDeeps(fileClassLocation.pathname)
    await makeDeepFile(fileOutLocation.pathname, cache, {
      makeBootstrap: argsParsed.parsed.values["init-bootstrap"],
    })
  }
}
