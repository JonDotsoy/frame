import * as tomy from '../../tomy'
import * as app from './app'
import * as cat_service from './cat.service'

const deeps = new Map<any, any[]>()

deeps.set(app.App, [cat_service.CatService])
deeps.set(cat_service.CatService, [])

export const ctx = tomy.createContext(deeps)
