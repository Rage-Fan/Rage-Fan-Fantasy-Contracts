"use strict";
Object.defineProperty(exports, "__esModule", { value: false });


import { Biconomy } from "@biconomy/mexa";
import { json } from "express";

const Web3 = require("web3");
const TruffleContract = require( "@truffle/contract");
const jsonData = require( './contracts/RageToken.json');
const config = require("./config");
const abiRageFactory = require("./contracts/RageFactory.json").abi;
const abiRageContest = require("./contracts/RageContest.json").abi;
const sigUtil = require("eth-sig-util");
const abiDecoder = require('abi-decoder');
const matictestProvider = new Web3.providers.HttpProvider(process.env.MaticProvider);
const biconomy = new Biconomy(matictestProvider, { apiKey: 'Mg4po8zbw.b0e298c7-8f86-4543-b9c5-64ae297ebc16', debug: true });
const fetch = require("node-fetch");
//console.log(biconomy);
// This web3 instance is used to read normally and write to contract via meta transactions.
const web3 = new Web3(biconomy);

exports.RageFanGameContractAPI = {
    createContractAddressAsync: async () => {
        var contractRageFactory; 
        var web3;      
        abiDecoder.addABI(config.CONTEST_CREATED_EVENT);

        let matictestProvider = new Web3.providers.HttpProvider(process.env.MaticProvider);

        const biconomy = new Biconomy(matictestProvider, { apiKey: 'Mg4po8zbw.b0e298c7-8f86-4543-b9c5-64ae297ebc16', debug: true });

        //console.log(biconomy);
        // This web3 instance is used to read normally and write to contract via meta transactions.
        web3 = new Web3(biconomy);
       const rageFactoryAddress = process.env.RageFactorycontract

        await biconomy.onEvent(biconomy.READY, async () => {
        // Initialize your dapp here like getting user accounts etc       

        contractRageFactory = new web3.eth.Contract(
          abiRageFactory, rageFactoryAddress              
        );

        console.log("RageFactory: ", contractRageFactory._address);    
        
                //do biconomy stuff here
                let d = new Date();
                d.setDate(d.getDate() + 11);
                console.log( d);

                let end = new Date();
                end.setDate(end.getDate() + 12);
                console.log( end);
            
                const unixstarttime = d.valueOf();
                const unixendtime = end.valueOf();

                let id= "1016";
                let name= "ENGvIND13APRIL";
                let starttime= unixstarttime;
                let endtime=unixendtime;
                let contesttitle = "WinnersTakeAll";
                let fee = 40;
                let winningAmount = 70000;
                let isActive = true;
                let tokenAddress = "0xdf538eC14801624b06214e9C4dE44b3CD555B374"

                let privateKey = "7aa1abed6634e14fbcbdfbce6f7100be17574d8a82a7c9698d7b04b214aaec01";  //process.env.OwnerPrivateKey;
                let userAddress = "0x508D3a0E42f04B1103e3684972A45F29C53d785b"; //process.env.OwnerAccounts;
                let nonce = await contractRageFactory.methods.getNonce(userAddress).call();
                let functionSignature = await contractRageFactory.methods.createNewContest(id, name, starttime, endtime, contesttitle, fee, winningAmount, isActive, tokenAddress).encodeABI();
                let message = {};
                message.nonce = parseInt(nonce);
                message.from = userAddress;
                message.functionSignature = functionSignature;

                const dataToSign = {
                    types: {
                        EIP712Domain: config.DOMAIN_TYPE,
                        MetaTransaction: config.META_TRANSACTION_TYPE
                    },
                    domain: config.DOMAIN_DATA_FACTORY,
                    primaryType: "MetaTransaction",
                    message: message
                };

                const signature = sigUtil.signTypedMessage(new Buffer.from(privateKey, 'hex'), { data: dataToSign }, 'V4');
                //const signature = sigUtil.signTypedData_v4(new Buffer.from(privateKey, 'hex'), { data: dataToSign } );                
               // let { r, s, v } = getSignatureParameters(signature, web3);
               if (!web3.utils.isHexStrict(signature)) {
                    throw new Error(
                    'Given value "'.concat(signature, '" is not a valid hex string.')
                    );
                }
              var r = signature.slice(0, 66);
              var s = "0x".concat(signature.slice(66, 130));
              var v = "0x".concat(signature.slice(130, 132));
              v = web3.utils.hexToNumber(v);
              if (![27, 28].includes(v)) v += 27;

                let executeMetaTransactionData = contractRageFactory.methods.executeMetaTransaction(userAddress, functionSignature, r, s, v).encodeABI();
                let txParams = {
                    "from": userAddress,
                    "to": rageFactoryAddress,
                    "value": "0x0",
                    "gas": "500000",
                    "data": executeMetaTransactionData
                };
                const signedTx = await web3.eth.accounts.signTransaction(txParams, `0x${privateKey}`);
                let receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction, (error, txHash) => {
                    if (error) {
                        console.error(error);
                    }
                    console.log("Transaction hash is ", txHash);
                    //showInfoMessage(`Transaction sent to blockchain with hash ${txHash}`);
                });

                // await contractRageFactory.once('ContestCreated', function(error, event){ 
                //     if (error) {
                //         console.error(error);
                //     }
                //     console.log(event);                 
                //     });

                // contractRageFactory.ContestCreated().get((error, result) => {
                //     if (error)
                //       console.log('Error in myEvent event handler: ' + error);
                //     else
                //       console.log('myEvent: ' + JSON.stringify(result.args));
                //   });
                const decodedLogs = abiDecoder.decodeLogs(receipt.logs);
                // console.log(decodedLogs);
                // decodedLogs.forEach(element => {
                //     console.log(element.name);                    
                //     console.log(element.events);
                // });
               
                let contestCreatedevent = decodedLogs.filter(function (e) {
                    return e.name == "ContestCreated";
                });

               console.log("contestCreatedevent", contestCreatedevent) ;

               var contestName="";
               var contestAddress=""; 
               if(contestCreatedevent){
                contestName =  contestCreatedevent[0].events[0].value;
                contestAddress = contestCreatedevent[0].events[1].value;

                   console.log("name: ", contestName);
                   console.log("contestAdress: ", contestAddress);
               }

                //console.log("Receipt  is ", receipt);
                            
        //console.log(gameParams);
        return contestAddress;
        }).onEvent(biconomy.ERROR, async (error, message) => {
            // Handle error while initializing mexa
            return "undefined";
        });
        
       
    },
    createNewContestAsync: async (gameParams) =>{
        var contractRageFactory;           
        abiDecoder.addABI(config.CONTEST_CREATED_EVENT);
        
        const rageFactoryAddress = process.env.RageFactorycontract   

        contractRageFactory = new web3.eth.Contract(
          abiRageFactory, rageFactoryAddress              
        );

        console.log("RageFactory: ", contractRageFactory._address);    
        
                //do biconomy stuff here    
                // let d = new Date();
                // d.setDate(d.getDate() + 11);
                // console.log( d);

                // let end = new Date();
                // end.setDate(end.getDate() + 12);
                // console.log( end);
            
                // const unixstarttime = d.valueOf();
                // const unixendtime = end.valueOf();

                let id= gameParams.id;
                let name= gameParams.name;
                let starttime= gameParams.starttime;
                let endtime= gameParams.endtime;
                let version = "1";
                let chainid = 80001;
                let contesttitle = gameParams.contesttitle;
                let fee = gameParams.fee;
                let winningAmount = gameParams.winningAmount;
                let isActive = gameParams.isActive;
                let tokenAddress = gameParams.tokenAddress;

                
                let privateKey = process.env.OwnerPrivateKey;
                let userAddress = process.env.OwnerAccounts;
                let nonce = await contractRageFactory.methods.getNonce(userAddress).call();
                let functionSignature = await contractRageFactory.methods.createNewContest(id, name, version, chainid, contesttitle, fee, winningAmount, isActive, tokenAddress).encodeABI();
                let message = {};
                message.nonce = parseInt(nonce);
                message.from = userAddress;
                message.functionSignature = functionSignature;

                const dataToSign = {
                    types: {
                        EIP712Domain: config.DOMAIN_TYPE,
                        MetaTransaction: config.META_TRANSACTION_TYPE
                    },
                    domain: config.DOMAIN_DATA_FACTORY,
                    primaryType: "MetaTransaction",
                    message: message
                };

                const signature = sigUtil.signTypedMessage(new Buffer.from(privateKey, 'hex'), { data: dataToSign }, 'V4');
                let { r, s, v } = await getSignatureParameters(signature);
               
                let executeMetaTransactionData = contractRageFactory.methods.executeMetaTransaction(userAddress, functionSignature, r, s, v).encodeABI();
                let txParams = {
                    "from": userAddress,
                    "to": rageFactoryAddress,
                    "value": "0x0",
                    "gas": "500000",
                    "data": executeMetaTransactionData
                };
                const signedTx = await web3.eth.accounts.signTransaction(txParams, `0x${privateKey}`);
                let receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction, (error, txHash) => {
                    if (error) {
                        console.error(error);
                    }
                    console.log("Transaction hash is ", txHash);                   
                });

                const decodedLogs = abiDecoder.decodeLogs(receipt.logs);             
               
                let contestCreatedevent = decodedLogs.filter(function (e) {
                    return e.name == "ContestCreated";
                });

               console.log("contestCreatedevent", contestCreatedevent) ;

               var contestName="";
               var contestAddress=""; 
               if(contestCreatedevent){
                contestName =  contestCreatedevent[0].events[0].value;
                contestAddress = contestCreatedevent[0].events[1].value;

                   console.log("name: ", contestName);
                   console.log("contestAdress: ", contestAddress);
               }

        return contestAddress;       
       
    },
    AddSmartContractAsync: async (contractAddress, gameId) => {
        
        const AuthToken = process.env.AuthTokenBiconomy_Test;
        const APIKey = process.env.APIKeyBiconomy_Test;
        const url = process.env.BiconomyAPIAddContractUrl_Test;               
        let contractCreated = false;

        let formData = new URLSearchParams({
          "contractName" : "RageContestContract"+ gameId,
          "contractAddress" : contractAddress,
          "abi" : JSON.stringify(abiRageContest),
         "contractType" : "SC",
          "metaTransactionType": "DEFAULT"
        })
    
        const requestOptions = {
          method: 'POST',
          headers: {  "Content-Type": "application/x-www-form-urlencoded", "authToken": AuthToken, "apiKey" : APIKey },
          body: formData
        };    
       

        try {
                let response = await fetch(url, requestOptions);
                let data = await response.json();
                console.log(data);

                if (data.code == 200 ){
                    contractCreated = true;
                }
                else {
                        contractCreated = false;
                    }
                //return data;
            } catch(err) {
                // catches errors both in fetch and response.json
                contractCreated = false;
                console.log(err);
                //return err;
            } 
            
            if(contractCreated){
            const urlMethods = process.env.BiconomyAPIAddMethodsUrl_Test;

            let formDataMethods = new URLSearchParams({
                "apiType" : "native",
                "methodType" : "write",
                "name":"RageContestTransaction"+gameId,
                "contractAddress" : contractAddress,
                "method" : "executeMetaTransaction"
               })
            
            const requestOptionsMethod = {
                method: 'POST',
                headers: {  "Content-Type": "application/x-www-form-urlencoded", "authToken": AuthToken, "apiKey" : APIKey },
                body: formDataMethods
              };

                try {
                    let responseM = await fetch(urlMethods, requestOptionsMethod);
                    let dataM = await responseM.json();
                    console.log(dataM);
                    return dataM;
                } catch(err) {
                    // catches errors both in fetch and response.json
                    console.log(err);
                    return err;
                }  
            }else {
                return undefined;
            }

    },
    cancelGameContestAsync: async (gameParams) =>{
        var contractRageContest;           
        abiDecoder.addABI(config.CONTEST_CREATED_EVENT);
        
        const rageContestAddress = gameParams.ContestAddress;   

        contractRageContest = new web3.eth.Contract(
            abiRageContest, rageContestAddress              
        );

        console.log("RageContest: ", contractRageContest._address);    
        
                
                let privateKey = process.env.OwnerPrivateKey;
                let userAddress = process.env.OwnerAccounts;
                let nonce = await contractRageContest.methods.getNonce(userAddress).call();
                let functionSignature = await contractRageContest.methods.cancelContest().encodeABI();
                let message = {};
                message.nonce = parseInt(nonce);
                message.from = userAddress;
                message.functionSignature = functionSignature;

                const DOMAIN_DATA_CONTEST = {
                    name: "RageContestContract",
                    version: "1",
                    chainId: process.env.ParentChainId,
                    verifyingContract: contractRageContest._address   
                };     

                const dataToSign = {
                    types: {
                        EIP712Domain: config.DOMAIN_TYPE,
                        MetaTransaction: config.META_TRANSACTION_TYPE
                    },
                    domain: DOMAIN_DATA_CONTEST,
                    primaryType: "MetaTransaction",
                    message: message
                };

                const signature = sigUtil.signTypedMessage(new Buffer.from(privateKey, 'hex'), { data: dataToSign }, 'V4');
                let { r, s, v } = await getSignatureParameters(signature);
               
                let executeMetaTransactionData = contractRageContest.methods.executeMetaTransaction(userAddress, functionSignature, r, s, v).encodeABI();
                let txParams = {
                    "from": userAddress,
                    "to": contractRageContest,
                    "value": "0x0",
                    "gas": "500000",
                    "data": executeMetaTransactionData
                };
                const signedTx = await web3.eth.accounts.signTransaction(txParams, `0x${privateKey}`);
                let receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction, (error, txHash) => {
                    if (error) {
                        console.error(error);
                    }
                    console.log("Transaction hash is ", txHash);                   
                });

                const decodedLogs = abiDecoder.decodeLogs(receipt.logs);             
               
                let contestCancelledevent = decodedLogs.filter(function (e) {
                    return e.name == "ContestCanceled";
                });

               console.log("contestCancelledevent", contestCancelledevent) ;               

        return true; 
    }

}

const getSignatureParameters = (signature) => {
    if (!web3.utils.isHexStrict(signature)) {
      throw new Error(
        'Given value "'.concat(signature, '" is not a valid hex string.')
      );
    }
    var r = signature.slice(0, 66);
    var s = "0x".concat(signature.slice(66, 130));
    var v = "0x".concat(signature.slice(130, 132));
    v = web3.utils.hexToNumber(v);
    if (![27, 28].includes(v)) v += 27;
    return {
      r: r,
      s: s,
      v: v
    };
  };