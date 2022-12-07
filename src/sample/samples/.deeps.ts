import { createContext } from "../../tomy"
import * as __App from "./App"
import * as __config from "./config"
import * as __db_DB from "./db/DB"
import * as __utils_server from "./utils/server"

export const deeps = new Map<any, any[]>()

deeps.set(__App.App, [__db_DB.default, __utils_server.Server])
deeps.set(__config.Config, [])
deeps.set(__db_DB.default, [__config.Config, __utils_server.Server])
deeps.set(__utils_server.Server, [__config.Config])

export const ctx = createContext(deeps)
