import React, { useState, useEffect } from "react";
import {Biconomy} from "@biconomy/mexa";
import Web3 from "web3";

const abi = require("./RageToken.json").abi;
const abiRageFactory = require("./RageFactory.json").abi;
const abiRageContest = require("./RageContest.json").abi;

const sigUtil = require("eth-sig-util");
// GineteToken contract address
const contractAddress = "0xb17A9A058F05573bF820601E3A6CC968bE39b495"; 
const rageFactoryAddress = "0x98b3825a7b1859191A1dEbF1b18496FAc26f0cd8";
const rageGenesisContest = "0x5374Ceb86cBe84150fA3A1e7BCe6C986d259Ea1d";
const rageContestAddress = "0x86FFFfe9A7476cA56CcCc8d404B840a8ADFc30b8"; //"0xfe944bc60fc7d8f5358a6d0d9de4f9a58fd3c2e7"; //"0x5ac0539060429082972fe9daedad30d75a3bb3a2";


//const biconomyAPIKey = 'BgHpxlSpJ.4268404e-fe03-402d-af18-0daad38c4ebb';  // Biconomy api key from the dashboard  
const parentChainId = 80001; // chain id of the network 
const maticProvider =  'https://rpc-mumbai.matic.today'; //'https://testnetv3.matic.network';

let config = {  
  apiKey: {
      test: "Mg4po8zbw.b0e298c7-8f86-4543-b9c5-64ae297ebc16",
      prod: "Mg4po8zbw.b0e298c7-8f86-4543-b9c5-64ae297ebc16"
  }
}

const domainType = [     
  { name: "name", type: "string" },     
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" }
];
const metaTransactionType = [
 { name: "nonce", type: "uint256" },
 { name: "from", type: "address" },
 { name: "functionSignature", type: "bytes" }
];
let domainData = {
 name: "RageToken",
 version: "1",
 chainId: parentChainId,
 verifyingContract: contractAddress   
};

let domainRageFactoryData = {
  name: "RageFactoryContract",
  version: "1",
  chainId: parentChainId,
  verifyingContract: rageFactoryAddress   
 };

 let domainRageContestData = {
  name: "RageContestContract",
  version: "1",
  chainId: parentChainId,
  verifyingContract: rageContestAddress   
 };

let web3, walletWeb3;
let contract, contractRageFactory, contractRageContest;
let provider;
//const [selectedAddress, setSelectedAddress] = useState("");

async function init() {
  if (
      typeof window.ethereum !== "undefined" &&
      window.ethereum.isMetaMask
  ) {
      // Ethereum user detected. You can now use the provider.
      provider = window["ethereum"];
      await provider.enable();
     // let kovanProvider = new Web3.providers.HttpProvider("https://kovan.infura.io/v3/d126f392798444609246423b06116c77");
     // setLoadingMessage("Initializing Biconomy ...");
      let matictestProvider = new Web3.providers.HttpProvider(maticProvider);
     const biconomy = new Biconomy(matictestProvider, { apiKey: 'Mg4po8zbw.b0e298c7-8f86-4543-b9c5-64ae297ebc16', debug: true });

      // This web3 instance is used to read normally and write to contract via meta transactions.
      web3 = new Web3(biconomy);
      
      // This web3 instance is used to get user signature from connected wallet
      walletWeb3 = new Web3(window.ethereum);

      biconomy.onEvent(biconomy.READY, () => {
          // Initialize your dapp here like getting user accounts etc
          contract = new web3.eth.Contract(
            abi, contractAddress
              // config.contract.abi,
              // config.contract.address
          );

          contractRageFactory = new web3.eth.Contract(
            abiRageFactory, rageFactoryAddress              
          );

          contractRageContest = new web3.eth.Contract(
            abiRageContest, rageContestAddress
          );

          console.log("RageFactory: ",contractRageFactory._address);
          console.log("RageContest: ",contractRageContest._address);
          console.log(contract);
          console.log(provider.selectedAddress);
          
      }).onEvent(biconomy.ERROR, (error, message) => {
          // Handle error while initializing mexa
      });
  } else {
      console.log("Metamask not installed");
  }
}
init();

  const amount =  "15000000000000000000"; //"1500000000000000000000000";    //"1000000000000000000";
  const recipient = "0xAE1043B0363D13fAC2FaF765a3C6d5020a32ecc6"; //"0xC26e931d3A4005Fec70E3Fd20C485744649f154A"; // "0xCaE5D611D456CE3650E1b80EC85406371D55Da68";
  
  const metaTransfer = async (type) => {
   
    let userAddress = provider.selectedAddress;
    console.log("3", provider.selectedAddress);
    //console.log("4", accounts);
    //let functionSignature = contract.methods.mint(amount).encodeABI();
    let functionSignature = "";
    let nonce = await contract.methods.getNonce(userAddress).call();
 
    console.log("Sending meta transaction", userAddress);

    if(type == 'Mint'){
      functionSignature = contract.methods.mint(amount).encodeABI();
      console.log("5", functionSignature );
     executeMetaTransaction(functionSignature, nonce); 
    }
    else if(type == 'Transfer'){
      functionSignature = contract.methods.transfer(recipient, amount).encodeABI();
      console.log("6", functionSignature );
      executeMetaTransaction(functionSignature, nonce); 
    }
    else if(type == 'ApproveTransfer'){  
      let nonce = await contract.methods.getNonce(userAddress).call();   
      let functionSignature = await contract.methods.approve(rageContestAddress, amount).encodeABI();
      console.log("7", functionSignature );
      await executeMetaTransaction(functionSignature, nonce); 

      functionSignature =  contract.methods.transferFrom( userAddress, rageContestAddress, amount).encodeABI();
      console.log("8", functionSignature );
      let nonce2 = (parseInt(nonce) + 1);
      executeMetaTransaction(functionSignature, nonce2);     
    } 
    else if(type == 'PlayNow'){  
     console.log("PlayNow methods called......");
      let nonce = await contract.methods.getNonce(userAddress).call();   
      let functionSignature = await contract.methods.approve(rageContestAddress, amount).encodeABI();
      console.log("7", functionSignature );
      await executeMetaTransaction(functionSignature, nonce); 

        let functionSignature1 =  await contractRageContest.methods.playNow(amount).encodeABI();
        console.log("8", functionSignature1 );
        //let nonce2 = (parseInt(nonce) + 1);
        let nonce2 = await contractRageContest.methods.getNonce(userAddress).call();         
        await executeRageContestMetaTransaction(functionSignature1, nonce2, true);
    } 
    else if(type == 'Cancel'){  
      console.log("Cancelled methods called......");
      let nonce = await contractRageContest.methods.getNonce(userAddress).call(); 
      ///nonce = (parseInt(nonce) + 1); 
      functionSignature =  await contractRageContest.methods.cancelContest().encodeABI();
      console.log("7", functionSignature );
      executeRageContestMetaTransaction(functionSignature, nonce, true);

        // let contracts = await contractRageFactory.methods.getContests().call();
        // console.log(contracts);       
    } 
    else if(type == 'withdrawfunds'){  
      console.log("withdrawfunds methods called......");
      let nonce = await contractRageContest.methods.getNonce(userAddress).call();      
      functionSignature =  await contractRageContest.methods.withdraw(amount).encodeABI();
      console.log("7", functionSignature );
      executeRageContestMetaTransaction(functionSignature, nonce, true); 
    } 
    else if (type == 'NewContest'){
      let ragenonce = await contractRageFactory.methods.getNonce(userAddress).call();

            let d = new Date();
            d.setDate(d.getDate() + 9);
            console.log( d);

            let end = new Date();
            end.setDate(end.getDate() + 10);
            console.log( end);
        
            const unixstarttime = d.valueOf();
            const unixendtime = end.valueOf();

              let id= "1010";
              let name= "ENGvIND05APRIL";
              let starttime= unixstarttime;
              let endtime=unixendtime;
              let contesttitle = "WinnersTakeAll";
              let fee = 40;
              let winningAmount = 40000;
              let isActive = true;
              let tokenAddress = "0xdf538eC14801624b06214e9C4dE44b3CD555B374"

      console.log("params", id, name, starttime, endtime, contesttitle, fee, winningAmount, isActive, tokenAddress) ;       
      functionSignature =  contractRageFactory.methods.createNewContest(id, name, starttime, endtime, contesttitle, fee, winningAmount, isActive, tokenAddress).encodeABI();
      console.log("7", functionSignature );
      //executeRageMetaTransaction(functionSignature, ragenonce, true); 
      executeRagePrivateKeyMetaTransaction(functionSignature, ragenonce, true);
    }    
 }; 
 
 const executeRagePrivateKeyMetaTransaction = async (functionSignature, nonce, meta) => {
  console.log("Sending meta transaction");
  let privateKey = "7aa1abed6634e14fbcbdfbce6f7100be17574d8a82a7c9698d7b04b214aaec01";
  let userAddress = "0x508D3a0E42f04B1103e3684972A45F29C53d785b";
  //let nonce = await contract.methods.getNonce(userAddress).call();
  //let functionSignature = contract.methods.setQuote(newQuote).encodeABI();

  let message = {};
  message.nonce = parseInt(nonce);
  message.from = userAddress;
  message.functionSignature = functionSignature;

  const dataToSign = {
      types: {
        EIP712Domain: domainType,
        MetaTransaction: metaTransactionType
      },
      domain: domainRageFactoryData,
      primaryType: "MetaTransaction",
      message: message
    };

    console.log(dataToSign);

  const signature = sigUtil.signTypedMessage(new Buffer.from(privateKey, 'hex'), { data: dataToSign }, 'V4');
  //const signature = sigUtil.signTypedData_v4(new Buffer.from(privateKey, 'hex'), { data: dataToSign } );                
  let { r, s, v } = getSignatureParameters(signature);
  let executeMetaTransactionData = contract.methods.executeMetaTransaction(userAddress, functionSignature, r, s, v).encodeABI();
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
          return console.error(error);
      }
      console.log("Transaction hash is ", txHash);
      //showInfoMessage(`Transaction sent to blockchain with hash ${txHash}`);
  });
  console.log("Receipt  is ", receipt);
 }
 
 const executeRageMetaTransaction = async (functionSignature, nonce, meta) => {
  // const accounts = await web3.eth.getAccounts();
  // let userAddress = accounts[0];
  if (meta){
  let userAddress = provider.selectedAddress;

  let message = {};
  message.nonce = parseInt(nonce);
  message.from = userAddress;
  message.functionSignature = functionSignature;

  const dataToSign = JSON.stringify({
    types: {
      EIP712Domain: domainType,
      MetaTransaction: metaTransactionType
    },
    domain: domainRageFactoryData,
    primaryType: "MetaTransaction",
    message: message
  });

    console.log(dataToSign);

    walletWeb3.eth.currentProvider.send(
      {
        jsonrpc: "2.0",
        id: 999999999999,
        method: "eth_signTypedData_v4",
        params: [userAddress, dataToSign]
    },
      function(error, response) {
        
        if(response){
          console.log("response", response);
          let { r, s, v } = getSignatureParameters(response.result);
          
          const recovered = sigUtil.recoverTypedSignature_v4({
            data: JSON.parse(dataToSign),
            sig: response.result
          });

          sendRageSignedTransaction(userAddress, functionSignature, r, s, v);             

        }
        //  let { r, s, v } = getSignatureParameters(response.result);
         
        //   const recovered = sigUtil.recoverTypedSignature_v4({
        //     data: JSON.parse(dataToSign),
        //     sig: response.result
        //   });
        //   let tx = contract.methods
        //   .executeMetaTransaction(userAddress, functionSignature,
        //    r, s, v)
        //   .send({
        //     from: userAddress
        //   });
      }
    );
  } else {
           console.log("Sending normal transaction");
           let d = new Date();
            d.setDate(d.getDate() + 7);
            console.log( d);

            let end = new Date();
            end.setDate(end.getDate() + 8);
            console.log( end);
        
            const unixstarttime = d.valueOf();
            const unixendtime = end.valueOf();

              let id= "1004";
              let name= "ENGvIND28March";
              let starttime= unixstarttime;
              let endtime=unixendtime;
              let contesttitle = "WinnersTakeAll";
              let fee = 50;
              let winningAmount = 60000;
              let isActive = true;
              let tokenAddress = contractAddress

           contractRageFactory.methods
                    .createNewContest(id, name, starttime, endtime, contesttitle, fee, winningAmount, isActive, tokenAddress)
                    .send({ from: provider.selectedAddress })
                    .on("transactionHash", function (hash) {
                        console.log(`Transaction sent to blockchain with hash ${hash}`);
                    })
                    .once("confirmation", function (confirmationNumber, receipt) {
                      console.log(confirmationNumber, receipt);
                    });
         }

  };
 const executeMetaTransaction = async (functionSignature, nonce) => {
    // const accounts = await web3.eth.getAccounts();
    // let userAddress = accounts[0];
    let userAddress = provider.selectedAddress;

    let message = {};
    message.nonce = parseInt(nonce);
    message.from = userAddress;
    message.functionSignature = functionSignature;

    const dataToSign = JSON.stringify({
      types: {
        EIP712Domain: domainType,
        MetaTransaction: metaTransactionType
      },
      domain: domainData,
      primaryType: "MetaTransaction",
      message: message
    });

      console.log(dataToSign);

      walletWeb3.eth.currentProvider.send(
        {
          jsonrpc: "2.0",
          id: 999999999999,
          method: "eth_signTypedData_v4",
          params: [userAddress, dataToSign]
      },
        function(error, response) {
          
          if(response){
            console.log("response", response);
            let { r, s, v } = getSignatureParameters(response.result);
            
            const recovered = sigUtil.recoverTypedSignature_v4({
              data: JSON.parse(dataToSign),
              sig: response.result
            });

                sendSignedTransaction(userAddress, functionSignature, r, s, v);             

          }         
        }
      );
  };

  const executeRageContestMetaTransaction = async (functionSignature, nonce, meta) => {
    // const accounts = await web3.eth.getAccounts();
    // let userAddress = accounts[0];
    if (meta){
    let userAddress = provider.selectedAddress;

    let message = {};
    message.nonce = parseInt(nonce);
    message.from = userAddress;
    message.functionSignature = functionSignature;

    const dataToSign = JSON.stringify({
      types: {
        EIP712Domain: domainType,
        MetaTransaction: metaTransactionType
      },
      domain: domainRageContestData,
      primaryType: "MetaTransaction",
      message: message
    });

      console.log(dataToSign);

      walletWeb3.eth.currentProvider.send(
        {
          jsonrpc: "2.0",
          id: 999999999999,
          method: "eth_signTypedData_v4",
          params: [userAddress, dataToSign]
      },
        function(error, response) {
          
          if(response){
            console.log("response", response);
            let { r, s, v } = getSignatureParameters(response.result);
            
            const recovered = sigUtil.recoverTypedSignature_v4({
              data: JSON.parse(dataToSign),
              sig: response.result
            });
              sendRageContestSignedTransaction(userAddress, functionSignature, r, s, v);           

          }
         
        }
      ); 
    
    }
    else{
      console.log("Sending normal transaction");
      contractRageContest.methods
                    .playNow(amount)
                    .send({ from: provider.selectedAddress })
                    .on("transactionHash", function (hash) {
                        console.log(`Transaction sent to blockchain with hash ${hash}`);
                    })
                    .once("confirmation", function (confirmationNumber, receipt) {
                      console.log(confirmationNumber, receipt);
                    });
    }
  };

  const sendRageContestSignedTransaction = async (userAddress, functionData, r, s, v) => {
  //   if (web3 && contractRageContest) {
  //     try {
  //         fetch(`https://api.biconomy.io/api/v2/meta-tx/native`, {
  //             method: "POST",
  //             headers: {
  //               "x-api-key" : "Mg4po8zbw.b0e298c7-8f86-4543-b9c5-64ae297ebc16",
  //               'Content-Type': 'application/json;charset=utf-8'
  //             },
  //             body: JSON.stringify({
  //               "to": rageContestAddress,
  //               "apiId": "fc2bd44b-8be8-4b72-a0b9-349facb23776",
  //               "params": [userAddress, functionData, r, s, v],
  //               "from": userAddress
  //             })
  //           })
  //           .then(response=>response.json())
  //           .then(async function(result) {
  //             console.log(result);
  //             console.log(`Transaction sent by relayer with hash ${result.txHash}`);
    
              
  //           }).catch(function(error) {
  //               console.log(error)
  //             });
  //     } catch (error) {
  //         console.log(error);
  //     }
  //  }
    if (web3 && contractRageContest) {
      try {
        console.log("owner", userAddress);
        let gasLimit = await contractRageContest.methods
            .executeMetaTransaction(userAddress, functionData, r, s, v)
            .estimateGas({ from: userAddress });
        let gasPrice = await web3.eth.getGasPrice();
        let tx = contractRageContest.methods
            .executeMetaTransaction(userAddress, functionData, r, s, v)
            .send({
                from: userAddress
            });

        tx.on("transactionHash", function (hash) {
            console.log(`Transaction hash is ${hash}`);
          }).once("confirmation", function (confirmationNumber, receipt) {
            console.log(receipt);            
        });
      } catch (error) {
        console.log(error);
       }
    }
 };  

    const sendRageSignedTransaction = async (userAddress, functionData, r, s, v) => {
      if (web3 && contractRageFactory) {
        try {
          console.log("owner", userAddress);
          let gasLimit = await contractRageFactory.methods
              .executeMetaTransaction(userAddress, functionData, r, s, v)
              .estimateGas({ from: userAddress });
          let gasPrice = await web3.eth.getGasPrice();
          let tx = contractRageFactory.methods
              .executeMetaTransaction(userAddress, functionData, r, s, v)
              .send({
                  from: userAddress
              });

          tx.on("transactionHash", function (hash) {
              console.log(`Transaction hash is ${hash}`);
            }).once("confirmation", function (confirmationNumber, receipt) {
              console.log(receipt);
              //setTransactionHash(receipt.transactionHash);
              //showSuccessMessage("Transaction confirmed on chain");
              //getQuoteFromNetwork();
          });
        } catch (error) {
          console.log(error);
         }
      }
   };  

    const sendSignedTransaction = async (userAddress, functionData, r, s, v) => {
      if (web3 && contract) {
        try {
          console.log("owner", userAddress);
          let gasLimit = await contract.methods
              .executeMetaTransaction(userAddress, functionData, r, s, v)
              .estimateGas({ from: userAddress });
          let gasPrice = await web3.eth.getGasPrice();
          let tx = contract.methods
              .executeMetaTransaction(userAddress, functionData, r, s, v)
              .send({
                  from: userAddress
              });

          tx.on("transactionHash", function (hash) {
              console.log(`Transaction hash is ${hash}`);
            }).once("confirmation", function (confirmationNumber, receipt) {
              console.log(receipt);
              //setTransactionHash(receipt.transactionHash);
              //showSuccessMessage("Transaction confirmed on chain");
              //getQuoteFromNetwork();
          });
        } catch (error) {
          console.log(error);
         }
      }
   };
   const getSignatureParameters = signature => {
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
  const AddSmartContract = async () => {
    // const accounts = await web3.eth.getAccounts();
    // let userAddress = accounts[0];
    const AuthToken = "066a736d-dd50-439e-9daa-4a47f0ed35bc";
    const APIKey = "Mg4po8zbw.b0e298c7-8f86-4543-b9c5-64ae297ebc16";
    const url = "https://api.biconomy.io/api/v1/smart-contract/public-api/addContract";
    
    var abi = JSON.stringify([{ "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "userAddress",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address payable",
            "name": "relayerAddress",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "bytes",
            "name": "functionSignature",
            "type": "bytes"
          }
        ],
        "name": "MetaTransactionExecuted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "constant": true,
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          }
        ],
        "name": "allowance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [
          {
            "internalType": "uint8",
            "name": "",
            "type": "uint8"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "subtractedValue",
            "type": "uint256"
          }
        ],
        "name": "decreaseAllowance",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "address",
            "name": "userAddress",
            "type": "address"
          },
          {
            "internalType": "bytes",
            "name": "functionSignature",
            "type": "bytes"
          },
          {
            "internalType": "bytes32",
            "name": "sigR",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "sigS",
            "type": "bytes32"
          },
          {
            "internalType": "uint8",
            "name": "sigV",
            "type": "uint8"
          }
        ],
        "name": "executeMetaTransaction",
        "outputs": [
          {
            "internalType": "bytes",
            "name": "",
            "type": "bytes"
          }
        ],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "getChainID",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "internalType": "address",
            "name": "user",
            "type": "address"
          }
        ],
        "name": "getNonce",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "nonce",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "addedValue",
            "type": "uint256"
          }
        ],
        "name": "increaseAllowance",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "initialSupply",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "isOwner",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "uint256",
            "name": "supply",
            "type": "uint256"
          }
        ],
        "name": "mint",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "transfer",
        "outputs": [
          {
            "internalType": "bool",
            "name": "success",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "transferFrom",
        "outputs": [
          {
            "internalType": "bool",
            "name": "success",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "burnToken",
        "outputs": [
          {
            "internalType": "bool",
            "name": "success",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]);

    let formData = new URLSearchParams({
      "contractName" : "FanTestTokenAPI",
      "contractAddress" : "0xdf538eC14801624b06214e9C4dE44b3CD555B374",
      "abi" : abi,
     "contractType" : "SC",
      "metaTransactionType": "DEFAULT"
     })

    const requestOptions = {
      method: 'POST',
      headers: {  "Content-Type": "application/x-www-form-urlencoded", "authToken": AuthToken, "apiKey" : APIKey },
      body: formData
    };

    for (var key of formData.entries()) {
			console.log(key[0] + ', ' + key[1])
		}

    const config1= {headers: { 'content-type': 'multipart/form-data', 'authToken': AuthToken, 'apiKey' : APIKey }}

    console.log("requestOptions", formData);

    // axios.post(url, formData, config1)
    //       .then(response => {
    //           console.log(response);
    //       })
    //       .catch(error => {
    //           console.log(error);
    //       });

    fetch(url, requestOptions)
      .then(response => response.json())
      .then(data => console.log(data))     
      .catch(error => console.error('Error:', error));
 };  

 const AddMethods = async () => {
  // const accounts = await web3.eth.getAccounts();
  // let userAddress = accounts[0];
  const AuthToken = "066a736d-dd50-439e-9daa-4a47f0ed35bc";
  const APIKey = "Mg4po8zbw.b0e298c7-8f86-4543-b9c5-64ae297ebc16";
  const url = "https://api.biconomy.io/api/v1/meta-api/public-api/addMethod";
  

  let formData = new URLSearchParams({
    "apiType" : "native",
    "methodType" : "write",
    "name":"FanTestTransaction",
    "contractAddress" : "0xdf538eC14801624b06214e9C4dE44b3CD555B374",
    "method" : "executeMetaTransaction"
   })

  const requestOptions = {
    method: 'POST',
    headers: {  "Content-Type": "application/x-www-form-urlencoded", "authToken": AuthToken, "apiKey" : APIKey },
    body: formData
  };

  // for (var key of formData.entries()) {
  //   console.log(key[0] + ', ' + key[1])
  // }

   console.log("requestOptions", formData);

  // axios.post(url, formData, config1)
  //       .then(response => {
  //           console.log(response);
  //       })
  //       .catch(error => {
  //           console.log(error);
  //       });

  fetch(url, requestOptions)
    .then(response => response.json())
    .then(data => console.log(data))     
    .catch(error => console.error('Error:', error));
}; 

    function App() {
      return (
        <div>
          <h3> FanTestToken </h3>
            <React.Fragment>
              {""}
              <button onClick={() => metaTransfer("Transfer")} size="small">
                Transfer
              </button>
            </React.Fragment>
            <React.Fragment>
              {""}
              <button onClick={() => metaTransfer("Mint")} size="small">
                Mint
              </button>
            </React.Fragment>
            <React.Fragment>
              {""}
              <button onClick={() => metaTransfer("ApproveTransfer")} size="small">
                ApproveTransfer
              </button>
            </React.Fragment>
            <React.Fragment>
              {""}
              <button onClick={() => metaTransfer("PlayNow")} size="small">
                Play Now
              </button>
            </React.Fragment>
            <React.Fragment>
              {""}
              <button onClick={() => metaTransfer("Cancel")} size="small">
                Cancel Contest
              </button>
            </React.Fragment>
            <React.Fragment>
              {""}
              <button onClick={() => metaTransfer("withdrawfunds")} size="small">
                Withdraw Funds
              </button>
            </React.Fragment>
            <React.Fragment>
              {""}
              <button onClick={() => AddSmartContract()} size="small">
                Add SmartContract
              </button>
            </React.Fragment>
            <React.Fragment>
              {""}
              <button onClick={() => AddMethods()} size="small">
                Add Methods
              </button>
            </React.Fragment>
            <React.Fragment>
              {""}
              <button onClick={() => metaTransfer("NewContest")} size="small">
                Create New Contest
              </button>
            </React.Fragment>
        </div>
      );
    }
    export default App;