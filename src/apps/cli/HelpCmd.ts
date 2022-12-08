import { ArgsParsed } from "./ArgsParsed"
import { CmdHandler } from "./CmdHandler"

export class HelpCmd implements CmdHandler {
  async cmdHandler(argsParsed: ArgsParsed) {
    console.log("help")
  }
}
