#!/usr/bin/env node

import { factory } from "./factory"
import { Cli } from "./apps/cli/Cli"
import { error } from "console"

factory(Cli)
  .then((cli) => cli.run())
  .catch((err) => {
    error(err)
    process.exitCode = 1
  })
