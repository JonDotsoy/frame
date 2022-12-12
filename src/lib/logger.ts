import { debuglog } from "util"

export class Logger {
  private nodeLog: import("util").DebugLogger

  constructor(namespace: string) {
    this.nodeLog = debuglog(namespace)
  }

  log(message: string) {
    this.nodeLog(message)
  }
}
