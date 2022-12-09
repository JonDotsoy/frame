import chalk = require("chalk")
import * as child_process from "child_process"
import { debug } from "console"
import { resolve } from "path"
import { createInterface } from "readline"
import { inspect } from "util"
import { beforeAll, describe, expect, it } from "vitest"

const exec = async (
  cwd: string,
  cmd: string,
  options?: {
    expectCode?: (code: null | number) => boolean
  }
): Promise<{
  outBuff: Uint8Array
  errBuff: Uint8Array
  childProcess: child_process.ChildProcess
}> => {
  const expectCode = options?.expectCode ?? ((code) => code === 0)
  const outBuff: number[] = []
  const errBuff: number[] = []
  console.debug(`> ${cmd}`)
  const childProcess = child_process.exec(cmd, { cwd })
  childProcess.stdout?.on("data", (buff) => outBuff.push(...buff))
  childProcess.stderr?.on("data", (buff) => errBuff.push(...buff))

  const rlStdout = createInterface({ input: childProcess.stdout! })
  rlStdout.on("line", (line) =>
    console.log(`${chalk.grey(`> ${cmd}:`)} ${line}`)
  )
  const rlStderr = createInterface({ input: childProcess.stderr! })
  rlStderr.on("line", (line) =>
    console.error(`${chalk.red(`> ${cmd}:`)} ${line}`)
  )

  await new Promise((r) => childProcess.once("close", r))

  if (!expectCode(childProcess.exitCode)) {
    const err = new Error(
      `Failed run command ${chalk.blue(
        inspect(cmd)
      )} since the exit code received was ${chalk.blue(
        inspect(childProcess.exitCode)
      )}`
    )
    Error.captureStackTrace(err, exec)
    throw err
  }

  console.log(
    `${chalk.grey(`> ${cmd}`)} exit code ${chalk.blue(
      inspect(childProcess.exitCode)
    )}`
  )

  return {
    outBuff: new Uint8Array(outBuff),
    errBuff: new Uint8Array(errBuff),
    childProcess,
  }
}

describe("Tom CLI", () => {
  const cwd = resolve(`${__dirname}/../e2e/a`)

  beforeAll(async () => {
    await exec(cwd, "npm install ../..")
  })

  it("use tom cli to run an app", async () => {
    const out = await exec(cwd, "npx tom run main.ts")

    expect(out.childProcess.exitCode).toMatchInlineSnapshot("0")
    expect(out.errBuff.length).toEqual(0)
  })
})
