import * as __App from "./App"
import * as __config from "./config"
import * as __db_DB from "./db/DB"
import * as __utils_server from "./utils/server"

export const classDeclarations = new Map<any, any[]>()

classDeclarations.set(__App.App, [__db_DB.default, __utils_server.Server])
classDeclarations.set(__config.Config, [])
classDeclarations.set(__db_DB.default, [__config.Config, __utils_server.Server])
classDeclarations.set(__utils_server.Server, [__config.Config])

