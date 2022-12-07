import DB from "./db/DB";
import { Server } from "./utils/server";

export class App {
    constructor(
        readonly db: DB,
        readonly server: Server,
    ) { }
}
