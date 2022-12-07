import * as __App from "./app"
import * as __cat_service from "./cat.service"

export const classDeclarations = new Map<any, any[]>()

classDeclarations.set(__App.App, [__cat_service.CatService])
classDeclarations.set(__cat_service.CatService, [])

