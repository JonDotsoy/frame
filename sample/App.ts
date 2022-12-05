import DBClient from "./DBClient";
import { ExpressServer } from "./ExpressServer";


export class App {
    constructor(
        dbClient: DBClient,
        private express: ExpressServer
    ) { }

    async listen() {
        await new Promise<void>(resolve => this.express.app.listen(resolve));
    }
}
