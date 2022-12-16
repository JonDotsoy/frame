import { createServer, Server, IncomingMessage, ServerResponse } from "http";
import { ControllerHTTP } from "./controller-http";

export class HTTP<
  Request extends typeof IncomingMessage = typeof IncomingMessage,
  Response extends typeof ServerResponse = typeof ServerResponse,
> {
  #server: Server<Request, Response>;
  #services = new Set<ControllerHTTP>()

  constructor() {
    this.#server = createServer(this.handler())
  }

  private handler() {
    return (req: InstanceType<Request>, res: InstanceType<Response> & { req: InstanceType<Request> }) => {
      return res.end()
    }
  }

  registerService(service: ControllerHTTP) {
    this.#services.add(service)
  }

  getPort(): number {
    const address = this.#server.address()

    if (typeof address === 'object' && address !== null) {
      return address.port
    }

    throw new Error('Server not ready yet')
  }

  async listen(port?: number) {
    await new Promise<void>(resolve => {
      this.#server.listen(port, resolve)
    })
  }
}
