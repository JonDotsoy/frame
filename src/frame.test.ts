import { it } from "node:test";
import { createContext } from "./frame"
import { App } from "./samples/App"
import { equal, ok, throws } from "node:assert";
import { Config } from "./samples/config";
import { chdir } from "node:process";

chdir(`${__dirname}/samples`)

it('create new instance', async () => {

    const app = createContext().factory(App)

    ok(app instanceof App, 'app is not a instance of App');
    equal(app.db.server, app.server)

})

it('reuse the context to get single instance', async () => {
    const ctx = createContext()

    const app1 = ctx.factory(App)
    const app2 = ctx.factory(App)
    const config = ctx.factory(Config)

    ok(app1 instanceof App, 'app1 is not a instance of App');
    ok(app2 instanceof App, 'app2 is not a instance of App');
    equal(app1, app2, 'Expected app1: App to be equal to app2: App')
    equal(app1.db.config, config, 'Expected app1.db.config to be equal config')
})

it('should fail if the class does not exists', () => {
    throws(() => {
        const ctx = createContext()
        ctx.factory(Crypto)
    })
})
