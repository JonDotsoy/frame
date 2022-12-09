import * as tom from "./tom"
import * as Cli from "./apps/cli/Cli"
import * as ArgsParsed from "./apps/cli/domains/args/ArgsParsed"
import * as CompileCmd from "./apps/cli/domains/compile/CompileCmdHandler"
import * as RunCmd from "./apps/cli/domains/run/RunCmdHandler"
import * as HelpCmd from "./apps/cli/domains/help/HelpCmdHandler"

const deeps = new Map<any, any[]>()

deeps.set(Cli.Cli, [
  ArgsParsed.ArgsParsed,
  CompileCmd.CompileCmdHandler,
  HelpCmd.HelpCmdHandler,
  RunCmd.RunCmdHandler,
])
deeps.set(ArgsParsed.ArgsParsed, [])
deeps.set(CompileCmd.CompileCmdHandler, [])
deeps.set(RunCmd.RunCmdHandler, [])
deeps.set(HelpCmd.HelpCmdHandler, [])

export const ctx = tom.createContext(deeps)
