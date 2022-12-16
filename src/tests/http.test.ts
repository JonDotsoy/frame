import { describe, expect, it } from "vitest";
import { factory } from "../factory";
import { HTTP } from "../lib/http/http";
import { CatApp } from "./__samples__/cat.app";


describe("Lib HTTP", () => {
  it("should listen a server", async () => {
    const http = await factory(HTTP)

    expect(http).not.toBeUndefined()

    await http.listen()

    expect(http.getPort()).toBeTypeOf('number')
  })

  it('should configure a controller', async () => {
    const app = await factory(CatApp)

    expect(app).not.toBeUndefined()
    expect(app.catController).not.toBeUndefined()
  })
})
