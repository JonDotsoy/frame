import { ArgsParsed } from "./domains/args/ArgsParsed"
import { CompileCmdHandler } from "./domains/compile/CompileCmdHandler"
import { RunCmdHandler } from "./domains/run/RunCmdHandler"
import { HelpCmdHandler } from "./domains/help/HelpCmdHandler"

export class Cli {
  constructor(
    readonly argsParsed: ArgsParsed,
    readonly compileCmdHandler: CompileCmdHandler,
    readonly helpCmdHandler: HelpCmdHandler,
    readonly runCmdHandler: RunCmdHandler
  ) {}

  async run() {
    switch (this.argsParsed.positional(0)) {
      case "compile":
        return this.compileCmdHandler.cmdHandler(this.argsParsed)

      case "run":
        return this.runCmdHandler.cmdHandler(this.argsParsed)

      case "help":
      default:
        return this.helpCmdHandler.cmdHandler(this.argsParsed)
    }
  }
}
