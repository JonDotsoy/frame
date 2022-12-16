import { describe, expect, it } from "vitest";
import { scanDeeps } from "../lib/scan-deeps";
import { pathToFileURL } from "node:url"
import { URLTransformer } from "../lib/url-transformer";
import { inspect } from "node:util";


describe("Make deep file", () => {
  it("should scan the sample cat.class.ts file", async () => {
    const appLocation = pathToFileURL(`${__dirname}/__samples__1/cat.app`);

    const cache = await scanDeeps(new URLTransformer(appLocation))

    expect(cache).matchSnapshot()
  })

  it("should scan the sample cat.class.js with cat.class.d.ts file", async () => {
    const appLocation = pathToFileURL(`${__dirname}/__samples__2/cat.app`);

    const cache = await scanDeeps(new URLTransformer(appLocation))

    expect(cache).matchSnapshot()
  })
})
