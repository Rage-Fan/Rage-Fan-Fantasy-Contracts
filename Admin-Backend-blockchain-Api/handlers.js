"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

//const HttpStatus = require("http-status-codes");
const RageFanGameContract = require("./RageFanGameContractAPI");

exports.handlers = {
    gameAPITestAsync: async (req, res) => {   
     var decodedLogs =    [ { name: 'ContestCreated',
                            events: [ [Object], [Object] ],
                            address: '0x0E13cbEdA9B5697117e352B79f7DD4fcc9C5D54E' },
                            { name: 'MetaTransactionExecuted',
                            events: [ [Object], [Object], [Object] ],
                            address: '0x0E13cbEdA9B5697117e352B79f7DD4fcc9C5D54E' } ]  
    
        console.log(decodedLogs[0].name);                    
        console.log(decodedLogs[0].events);

        res.json({ success: true, message: "Contests API  working fine v1.0.1!" });
    },
    showContractAddressAsync: async (req, res) => {

         var contract_address = await RageFanGameContract.RageFanGameContractAPI.createContractAddressAsync();
         console.log(contract_address);
         if( contract_address ){
                res.json( { "success": true, "message": "Game Contract Address Found and returned successfully", "contract_address" :  contract_address });   
         }
         else{
               res.json ({ "success": false, "message": "Something went wrong!!" });    
         }
    },
    createNewContestAsync: async (req, res) => {
        const gameParams = unmarshallGameParams(req.body);
        var contract_address = await RageFanGameContract.RageFanGameContractAPI.createNewContestAsync(gameParams);
        console.log(contract_address);
        if( contract_address ){
            var data = await RageFanGameContract.RageFanGameContractAPI.AddSmartContractAsync(contract_address, gameParams.id); 
            
            res.json( { "success": true, "message": "New game contest created successfully", "contract_address" :  contract_address, "biconomyAPI" : data });   
        }
        else{
              res.json ({ "success": false, "message": "Something went wrong!!" });    
        }
   },
   addContractAddressToBiconomy: async (req, res) => {
    const contractParams = unmarshallcontractAPIParams(req.body);
    var data = await RageFanGameContract.RageFanGameContractAPI.AddSmartContractAsync(contractParams.contractAddress, contractParams.id);
       // console.log(data);
        if( data ){
            res.json( { "success": true, "message": data});   
        }
        else{
            res.json ({ "success": false, "message": "Something went wrong!!" });    
        }

   } 

};

function unmarshallGameParams(gameParamsRaw) {
    const newGameParams = {
        id :  gameParamsRaw.id,
        name: gameParamsRaw.name, 
        starttime: gameParamsRaw.starttime, 
        endtime: gameParamsRaw.endtime,
        contesttitle: gameParamsRaw.contesttitle, 
        fee : gameParamsRaw.fee,
        winningAmount: gameParamsRaw.winningAmount, 
        isActive: gameParamsRaw.isActive, 
        tokenAddress: gameParamsRaw.tokenAddress
        
    };
    return newGameParams;
}
function unmarshallcontractAPIParams(contractAPIRaw) {
    const newcontractAPIParams = {
        id :  gameParamsRaw.id,
        contractAddress: gameParamsRaw.contractAddress
        
    };
    return newcontractAPIParams;
}
