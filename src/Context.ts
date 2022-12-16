import { refCurrentContext } from "./current_ctx";
import { generatorInstance } from "./generatorInstance";


export class Context {
  constructor(
    private deeps: Map<any, any[]> = new Map(),
    private instancesMap: Map<any, any> = new Map()
  ) { }

  get<T>(C: new (...args: any) => T): T {
    refCurrentContext.current = this
    try {
      return generatorInstance(this.deeps, this.instancesMap, C);
    } finally {
      refCurrentContext.current = null
    }
  }
}
