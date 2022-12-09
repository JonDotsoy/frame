import { ArgsParsed } from "../domains/args/ArgsParsed"

export interface CmdHandler {
  cmdHandler(argsParsed: ArgsParsed): Promise<void>
}
