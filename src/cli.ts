import { factory } from "./factory"
import { Cli } from "./apps/cli/Cli"

factory(Cli)
  .then((cli) => cli.run())
  .catch(console.error)
