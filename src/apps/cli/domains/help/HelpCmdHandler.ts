import { ArgsParsed } from "../args/ArgsParsed"
import { CmdHandler } from "../../types/CmdHandler"

export class HelpCmdHandler implements CmdHandler {
  async cmdHandler(argsParsed: ArgsParsed) {
    console.log("help")
  }
}
