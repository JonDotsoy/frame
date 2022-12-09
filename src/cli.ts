#!/usr/bin/env node

import { factoryAndRun } from "./factory"
import { Cli } from "./apps/cli/Cli"

factoryAndRun(Cli)
