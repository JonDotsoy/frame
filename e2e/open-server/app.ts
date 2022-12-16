import { HTTP } from "tomts/dist/lib/http/http"

export class App {
    constructor(
        readonly http: HTTP
    ) {
        
    }

    async bootstrap() {
        await this.http.listen()
        console.log(`Server ready on ${this.http.getPort()}`)
    }
}
