import { ArgsParsed } from "./ArgsParsed"

export interface CmdHandler {
  cmdHandler(argsParsed: ArgsParsed): Promise<void>
}
