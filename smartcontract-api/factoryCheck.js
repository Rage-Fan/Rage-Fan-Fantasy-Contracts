Web3 = require('web3')
const XLSX = require('xlsx');
const web3 = new Web3(new Web3.providers.HttpProvider("https://rpc-mumbai.maticvigil.com/"));
const Tx = require('ethereumjs-tx')
const rageCoinContract = "0xb17A9A058F05573bF820601E3A6CC968bE39b495";
const abiDefinition = require('./rageContestAbi.json');
const rageFactory = require('./rageFactory.json');
const config = require('./config.js')
// const erc = web3.eth.contract(abi).at(rageCoinContract);
// const sender = "0x508d3a0e42f04b1103e3684972a45f29c53d785b"; Contract Deployed
const sender = "0x7454D4e57Cd285744D685a7f62aDfcac4ecBaAC6" //My Address
const privatekey = '7d9524b54ff4d15f6e9c75ae8d974d2af0258d887e541aed4489960eee143638';
const secret = new Buffer(privatekey, 'hex');
const contractAddress = "0x6f78AfB780209B33Af5D7af56eFb693D7fEC2521";
var smarContract = web3.eth.contract(rageFactory).at(contractAddress);



let ownerAddress = "0x7454D4e57Cd285744D685a7f62aDfcac4ecBaAC6";
let id = "01";


var rawTransaction = {
    "nonce": web3.toHex(web3.eth.getTransactionCount(sender)),
    "gasPrice": 4000000000,
    "gasLimit": 10000000,
    "to": contractAddress,
    data: smarContract.createNewContest.getData(sender, "59", "140 Trage", 1618491600, 1618495200000, "Oeiras vs Miranda Dragons (Safe)", 10, 140, true, rageCoinContract, { from: sender }),
    chainId: config.chainId
}
var tx = new Tx(rawTransaction);
tx.sign(secret);

var serializedTx = tx.serialize();
var sendString = serializedTx.toString('hex');
web3.eth.sendRawTransaction(`0x${sendString}`, async function (err, result) {
    if (!err) {
        console.log("Success", result);
        await smarContract.ContestCreated(function (err, result) {
            if (err) {
                console.error("err",err);
                return error(err);
            }
            log("Count was incremented by all: " + result);
            log("Count was incremented by name: " + result.args.name);
            log("Count was incremented by address: " + result.args.contestAddress);
        });

        //   res.json({ status: 'Success', recepit: result })
    } else {
        console.error("err", err.message)
        //   res.json({ status: 'Failure', recepit: null })
    }
})