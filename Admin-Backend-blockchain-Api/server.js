"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const cors = require("cors");
const express = require("express");
const asyncHandler = require("express-async-handler");
const handlersasync = require("./handlers");
//require("reflect-metadata");

class Server {
    constructor() {
    }
    async initServer() {
        try {
           
            // 
            this.app = await express();
            this.app.use(express.json({ limit: '50mb' }));            
            this.app.use(express.urlencoded({
                limit: '50mb',
                extended: true,
                parameterLimit: 50000
            }));
            this.app.use(cors());
            this.app.options('*', cors());
            //this.app.post('/v1/games', asyncHandler(handlers_1.handlers.postUserAsync));
            this.app.get('/api/v1/gamesapi', asyncHandler(handlersasync.handlers.gameAPITestAsync));
            this.app.get('/api/v1/showcontractaddress', asyncHandler(handlersasync.handlers.showContractAddressAsync));
            this.app.post('/api/v1/createNewContest', asyncHandler(handlersasync.handlers.createNewContestAsync));
            this.app.get('/api/v1/addContractAddressToBiconomy', asyncHandler(handlersasync.handlers.addContractAddressToBiconomy));
            
            await this.healthCheckRoute();
            return this.app;
        }
        catch (err) {
            throw err;
        }
    }
    async healthCheckRoute() {
        try {
            this.app.get('/', (req, res) => {
                console.log(req.body);
                res.json({
                    status: 'HEALTHY',
                    msg: 'This works perfectly fine'
                });
            });
        }
        catch (err) {
            throw err;
        }
    }
}
exports.default = Server;
