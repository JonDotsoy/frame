import { relative } from "path"
import { fileURLToPath } from "node:url"

export class URLTransformer {
  constructor(readonly url: URL, readonly urlSource?: URL | string) { }

  toURL() {
    return this.url
  }

  toDirname() {
    return new URLTransformer(new URL('./', this.url))
  }

  toPath() {
    return fileURLToPath(this.toURL())
  }

  toString(): string {
    return this.url.toString()
  }

  toRelativeFrom(from: string): string {
    return relative(from, this.url.pathname)
  }

  static fromPlainURL(urlLike: string): URLTransformer {
    return new URLTransformer(new URL(urlLike))
  }
}
