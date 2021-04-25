Web3 = require('web3')
const XLSX = require('xlsx');
const web3 = new Web3(new Web3.providers.HttpProvider("https://rpc-mumbai.maticvigil.com/"));
const Tx = require('ethereumjs-tx')
const rageCoinContract = "0xb17A9A058F05573bF820601E3A6CC968bE39b495";
const abiDefinition = require('./rageContestAbi.json');
const multiTransferAbi = require('./multiTransfer.json');
const config = require('./config.js')
// const erc = web3.eth.contract(abi).at(rageCoinContract);
// const sender = "0x508d3a0e42f04b1103e3684972a45f29c53d785b"; Contract Deployed
const sender = "0x7454D4e57Cd285744D685a7f62aDfcac4ecBaAC6" //My Address
const privatekey = '7d9524b54ff4d15f6e9c75ae8d974d2af0258d887e541aed4489960eee143638';
const secret = new Buffer(privatekey, 'hex');
const contractAddress = "0x1a0bf02E7A4495140Ac9bB054E526c50b7506548";
var smarContract = web3.eth.contract(multiTransferAbi).at(contractAddress);

var workbook = XLSX.readFile('./assets/Punjab Kings vs Mumbai Indians 23 Apr 2021.xls');// ./assets is where your relative path directory where excel file is, if your excuting js file and excel file in same directory just igore that part
var sheet_name_list = workbook.SheetNames; // SheetNames is an ordered list of the sheets in the workbook
console.log("sheet_name", sheet_name_list);
data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]); //if you have multiple sheets


let address = [];
let amount = [];

for (var key in data) {
	address.push(data[key]['address']);
	amount.push(data[key]['tokens']);
}
console.log(address);
console.log(amount);

var rawTransaction = {
    "nonce": web3.toHex(web3.eth.getTransactionCount(sender)),
    "gasPrice": 4000000000,
    "gasLimit": 10000000,
    "to": contractAddress,
    data: smarContract.transfer.getData(rageCoinContract,address,amount, { from: sender }),
    chainId: config.chainId
  }
  var tx = new Tx(rawTransaction);
  tx.sign(secret);

  var serializedTx = tx.serialize();
  var sendString = serializedTx.toString('hex');
  web3.eth.sendRawTransaction(`0x${sendString}`, function (err, result) {
    if (!err) {
        console.log("Success",result);
    //   res.json({ status: 'Success', recepit: result })
    } else {
      console.error("err", err.message)
    //   res.json({ status: 'Failure', recepit: null })
    }
  })