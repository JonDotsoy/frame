import { parseArgs } from "util"

export const globalArgsParsed = parseArgs({
  allowPositionals: true,
  options: {
    "init-bootstrap": {
      type: "boolean",
      multiple: false,
    },
  },
})
