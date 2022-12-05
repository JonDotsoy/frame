import { Config } from "../config";
import { Server } from "../utils/server";

export default class DB {
    constructor(readonly config: Config, readonly server: Server) { }
}
