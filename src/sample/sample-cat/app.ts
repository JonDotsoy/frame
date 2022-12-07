import { CatService } from "./cat.service";

export class App {
    constructor(readonly catService: CatService) { }
}
