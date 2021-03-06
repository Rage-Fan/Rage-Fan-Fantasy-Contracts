import React, { useState, useEffect } from "react";
import {Biconomy} from "@biconomy/mexa";
import Web3 from "web3";
import $ from "jquery";
import TruffleContract from "@truffle/contract";
import jsonData from './FanTestToken.json';

const abi = require("./FanTestToken.json").abi;
const sigUtil = require("eth-sig-util");
// GineteToken contract address
const contractAddress = "0xdf538eC14801624b06214e9C4dE44b3CD555B374"; 
//const biconomyAPIKey = 'BgHpxlSpJ.4268404e-fe03-402d-af18-0daad38c4ebb';  // Biconomy api key from the dashboard  
const parentChainId =  '80001'; // chain id of the network 
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
 name: "FanTestToken",
 version: "1",
 chainId: parentChainId,
 verifyingContract: contractAddress   
};

let web3, walletWeb3;
let contracts = {};
let contract;
let provider;
//const [selectedAddress, setSelectedAddress] = useState("");

async function init() {
 
     // let kovanProvider = new Web3.providers.HttpProvider("https://kovan.infura.io/v3/d126f392798444609246423b06116c77");
     // setLoadingMessage("Initializing Biconomy ...");
      let matictestProvider = new Web3.providers.HttpProvider(maticProvider);
      const biconomy = new Biconomy(matictestProvider, { apiKey: 'Mg4po8zbw.b0e298c7-8f86-4543-b9c5-64ae297ebc16', debug: true });

      // This web3 instance is used to read normally and write to contract via meta transactions.
      web3 = new Web3(biconomy);      
      // This web3 instance is used to get user signature from connected wallet
     // walletWeb3 = new Web3(window.ethereum);

      biconomy.onEvent(biconomy.READY, () => {
          // Initialize your dapp here like getting user accounts etc
          contract = new web3.eth.Contract(
            abi, contractAddress              
          );
         
        
            // Instantiate a new truffle contract from the artifact
            contracts.FanTestToken = TruffleContract(JSON.parse(JSON.stringify(jsonData)));
            // Connect provider to interact with contract
            contracts.FanTestToken.setProvider(matictestProvider);
            contracts.FanTestToken.deployed().then(function(instance) {
              console.log("Fan Test Token Address: ", instance.address);
            });
         
          console.log(contract);
          //console.log(contract.currentProvider.selectedAddress);
          //setSelectedAddress(provider.selectedAddress);
          //getQuoteFromNetwork();
          // provider.on("accountsChanged", function (accounts) {
          //      setSelectedAddress(accounts[0]);
               
          //  });
      }).onEvent(biconomy.ERROR, (error, message) => {
          // Handle error while initializing mexa
      });
//   } else {
//       console.log("Metamask not installed");
//   }
}
init();

// window.ethereum.enable().catch(error => {
//   console.log(error); 
// });
// const web3 = new Web3(window.ethereum); 
// const biconomy = new Biconomy(
// new Web3.providers.HttpProvider(maticProvider),
// {
//     apiKey: biconomyAPIKey,
//     debug: true     
// }   
// ); 
// const getWeb3 = new Web3(biconomy);  
// biconomy
//   .onEvent(biconomy.READY, () => {
//      console.log("Mexa is Ready");
//   })
//   .onEvent(biconomy.ERROR, (error, message) => {
//      console.error(error);
//   });
  //const contract = new web3.eth.Contract(abi, contractAddress);
  const amount =  "15000000000000000000";    //"1000000000000000000";
  const recipient = "0xAE1043B0363D13fAC2FaF765a3C6d5020a32ecc6"; //"0xC26e931d3A4005Fec70E3Fd20C485744649f154A"; // "0xCaE5D611D456CE3650E1b80EC85406371D55Da68";
  
  const metaTransfer = async (type) => {
    // const accounts = await web3.eth.getAccounts();
    // let userAddress = accounts[0];
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
      functionSignature =  contract.methods.approve(userAddress, amount).encodeABI();
      console.log("7", functionSignature );
      executeMetaTransaction(functionSignature, nonce); 

      functionSignature =  contract.methods.transferFrom( userAddress, recipient, amount).encodeABI();
      console.log("8", functionSignature );
      let nonce2 = (parseInt(nonce) + 1);
      executeMetaTransaction(functionSignature, nonce2); 
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
            
        </div>
      );
    }
    export default App;