import * as tom from "./tom"
import * as cli from "./cli"
import * as factory from "./factory"
import * as make_deepFile from "./lib/make-deepFile"
import * as cache from "./lib/dto/cache"
import * as short_definition from "./lib/short-definition"
import * as little_script from "./lib/little-script"
import * as scan_deeps from "./lib/scan-deeps"
import * as Cli from "./apps/cli/Cli"
import * as ArgsParsed from "./apps/cli/ArgsParsed"
import * as parsed from "./apps/cli/parsed"
import * as CompileCmd from "./apps/cli/CompileCmd"
import * as CmdHandler from "./apps/cli/CmdHandler"
import * as RunCmd from "./apps/cli/RunCmd"
import * as HelpCmd from "./apps/cli/HelpCmd"

const deeps = new Map<any, any[]>()

deeps.set(Cli.Cli, [
  ArgsParsed.ArgsParsed,
  CompileCmd.CompileCmd,
  HelpCmd.HelpCmd,
  RunCmd.RunCmd,
])
deeps.set(ArgsParsed.ArgsParsed, [])
deeps.set(CompileCmd.CompileCmd, [])
deeps.set(RunCmd.RunCmd, [])
deeps.set(HelpCmd.HelpCmd, [])

export const ctx = tom.createContext(deeps)
