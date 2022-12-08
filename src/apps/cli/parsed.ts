import { parseArgs } from "util"

export const parsed = parseArgs({
  allowPositionals: true,
  options: {
    "init-bootstrap": {
      type: "boolean",
      multiple: false,
    },
  },
})
