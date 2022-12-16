import { CatController } from "./cat.controller";

export class CatApp {
  constructor(
    readonly catController: CatController
  ) { }
}
