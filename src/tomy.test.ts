import { it } from "node:test"
import { App } from "./samples/samples/App"
import { equal, ok, throws } from "node:assert"
import { Config } from "./samples/samples/config"
import { chdir } from "node:process"
import { ctx } from "./samples/samples/.deeps"
import { app } from "./samples/samples/app.instance"

chdir(`${__dirname}/samples`)

it("create new instance", async () => {
  ok(app instanceof App, "app is not a instance of App")
  equal(app.db.server, app.server)
})

it("reuse the context to get single instance", async () => {
  const app1 = ctx.get(App)
  const app2 = ctx.get(App)
  const config = ctx.get(Config)

  ok(app1 instanceof App, "app1 is not a instance of App")
  ok(app2 instanceof App, "app2 is not a instance of App")
  equal(app1, app2, "Expected app1: App to be equal to app2: App")
  equal(app1.db.config, config, "Expected app1.db.config to be equal config")
})

it("should fail if the class does not exists", () => {
  throws(() => {
    ctx.get(Crypto)
  })
})
