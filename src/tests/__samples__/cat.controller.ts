import { ControllerHTTP, Methods } from "../../lib/http/controller-http";


export class CatController extends ControllerHTTP {
  method: Methods = 'GET';
  pathname = '/hola';

  handler(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
