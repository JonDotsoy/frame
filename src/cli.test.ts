import * as child_process from "child_process"
import { log } from "console"
import { resolve } from "path"
import { stderr, stdout } from "process"
import { createInterface } from "readline"
import { assert, describe, expect, it } from "vitest"

const exec = async (
  cwd: string,
  cmd: string
): Promise<{
  outBuff: Uint8Array
  errBuff: Uint8Array
  childProcess: child_process.ChildProcess
}> => {
  const outBuff: number[] = []
  const errBuff: number[] = []
  const childProcess = child_process.exec("npx tomy run main.ts", { cwd })
  childProcess.stdout?.on("data", (buff) => outBuff.push(...buff))
  childProcess.stderr?.on("data", (buff) => errBuff.push(...buff))
  const rlStdout = createInterface({ input: childProcess.stdout! })
  rlStdout.on("line", console.log)
  const rlStderr = createInterface({ input: childProcess.stderr! })
  rlStderr.on("line", console.error)
  await new Promise((r) => childProcess.once("close", r))
  return {
    outBuff: new Uint8Array(outBuff),
    errBuff: new Uint8Array(errBuff),
    childProcess,
  }
}

describe("Tomy CLI", () => {
  const cwd = resolve(`${__dirname}/../e2e/a`)

  it("use tomy cli to run an app", async () => {
    const out = await exec(cwd, "npx tomy run main.ts")

    expect(out.childProcess.exitCode).toMatchInlineSnapshot("0")
    expect(out.errBuff.length).toEqual(0)
  })
})
