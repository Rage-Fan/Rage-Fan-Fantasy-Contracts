"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cluster = require("cluster");
const http = require("http");
const os = require("os");
//import Logger from './src/helpers/logger';
const server = require("./server");

require('dotenv').config()
const porttest = process.env.PORT;

class Application {
    constructor() {
        this.serverObj = new server.default();
    }
    async initApp() {
        this.port = process.env.PORT; //config.get('server.port');
        this.app = await this.serverObj.initServer();
        //this.logger = new Logger();
        // await this.logger.init();
        this.app.set('port', this.port);
        await this.initAppServer();
    }
    async initAppServer() {
        this.numCpus = 1; //os.cpus().length;
        if (cluster.isMaster) {
            let i = 0;
            for (i = 0; i < this.numCpus; i++) {
                await cluster.fork();
            }
            await cluster.on('exit', (worker, code, signal) => {
                console.log(`Cluster Worker died | worker: ${worker.process.pid}, ${code},${signal} `);
                //this.logger.logError(`Cluster Worker died | worker: ${worker.process.pid}`);
            });
        }
        else {
            try {
                this.server = await http.createServer(this.app);
                this.server.listen(this.port);
                await this.server.on('listening', () => {
                    this.address = this.server.address();
                    this.bind = typeof this.address === 'string' ? `pipe ${this.address}` : `port ${this.address.port}`;
                    // this.logger.logDebug(`Listening On: ${this.bind}`);
                    //this.logger.logInfo(`Server running on: ${this.port}`);
                    console.log(`Server running on: ${this.port}`);
                });
            }
            catch (err) {
                console.log(err);
                throw err;
            }
        }
    }
}
const app = new Application();
(async () => {
    process.setMaxListeners(0);
    await app.initApp();
})();
