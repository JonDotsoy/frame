import { spawn } from "child_process";
import { createWriteStream } from "fs";
import { argv } from "process";

const ws = createWriteStream('.log')

const [cmd, _, ...args] = argv

// console.log(argv)

const p = spawn(cmd, args, {})

p.stderr.pipe(ws)
p.stdout.pipe(ws)
