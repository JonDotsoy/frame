import { ArgsParsed } from "./ArgsParsed"
import { CompileCmd } from "./CompileCmd"
import { RunCmd } from "./RunCmd"
import { HelpCmd } from "./HelpCmd"

export class Cli {
  constructor(
    readonly argsParsed: ArgsParsed,
    readonly compileCmd: CompileCmd,
    readonly helpCmd: HelpCmd,
    readonly runCmd: RunCmd
  ) {}

  async run() {
    switch (this.argsParsed.positional(0)) {
      case "compile":
        return this.compileCmd.cmdHandler(this.argsParsed)
      case "run":
        return this.runCmd.cmdHandler(this.argsParsed)
      case "help":
      default:
        return this.helpCmd.cmdHandler(this.argsParsed)
    }
  }
}
