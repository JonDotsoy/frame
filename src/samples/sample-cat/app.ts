import { CatService } from "./cat.service"

export class App {
  constructor(readonly catService: CatService) {}

  run() {
    console.log("ok")
  }
}
