import { getCurrentContext } from "../../current_ctx";
import { HTTP } from "./http";

export type Methods = 'GET' | 'HEAD' | 'POST' | 'DELETE' | 'PUT'

export abstract class ControllerHTTP {
  abstract method: Methods
  abstract pathname: string

  constructor() {
    const http = getCurrentContext().get(HTTP)
    http.registerService(this)
  }

  abstract handler(): Promise<void>
}
