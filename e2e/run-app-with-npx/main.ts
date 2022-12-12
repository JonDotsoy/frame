import { log } from "node:console"
import { CatService } from "./cat.service"

export class App {
  constructor(readonly cat: CatService) {}
  async run() {
    this.cat.hello()
  }
}
