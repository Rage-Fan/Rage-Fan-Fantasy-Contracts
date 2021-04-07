"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

// Network port to listen on
exports.HTTP_PORT = 3002;

exports.DOMAIN_TYPE = [     
    { name: "name", type: "string" },     
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" }
  ];

exports.META_TRANSACTION_TYPE = [
    { name: "nonce", type: "uint256" },
    { name: "from", type: "address" },
    { name: "functionSignature", type: "bytes" }
   ];  

exports.DOMAIN_DATA_TOKEN = {
    name: "RageToken",
    version: "1",
    chainId: process.env.ParentChainId,
    verifyingContract: process.env.Tokencontract     
   };  
   
exports.DOMAIN_DATA_FACTORY = {
    name: "RageFactoryContract",
    version: "1",
    chainId: process.env.ParentChainId,
    verifyingContract: process.env.RageFactorycontract   
   };     

exports.DOMAIN_DATA_CONTEST = {
    name: "FirstGameOfCricket",
    version: "1",
    chainId: process.env.ParentChainId,
    verifyingContract: process.env.RageContestContract
};      
   

exports.CONTEST_CREATED_EVENT = [{
  "anonymous": false,
  "inputs": [
    {
      "indexed": false,
      "internalType": "string",
      "name": "name",
      "type": "string"
    },
    {
      "indexed": false,
      "internalType": "address",
      "name": "newContest",
      "type": "address"
    }
  ],
  "name": "ContestCreated",
  "type": "event"
}]  
