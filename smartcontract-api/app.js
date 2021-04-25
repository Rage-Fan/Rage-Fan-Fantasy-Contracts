const axios = require('axios');

const express = require('express');

const Tx = require('ethereumjs-tx');

const config = require('./config.js');

const https = require('https');
var cors = require('cors')
var corsOptions = {
  origin: '*'
}

const fs = require('fs');

app = module.exports = express();
app.use(cors(corsOptions))

app.set('view engine', 'ejs');
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded({ extended: true })); //Parse URL-encoded bodies
if (!module.parent) {
  server = https.createServer({
    key: fs.readFileSync('/etc/letsencrypt/live/alpha.rage.fan/privkey.pem', 'utf8'),
    cert: fs.readFileSync('/etc/letsencrypt/live/alpha.rage.fan/fullchain.pem', 'utf8')
  }, app).listen(3000, () => {
    console.log('Listening... 3000')
  });
}
// if (!module.parent) {
//   app.listen(3000)
//   console.log('Running in port 3000');
// }
Web3 = require('web3')

const web3 = new Web3(new Web3.providers.HttpProvider(config.rpcUrl));

let sender = config.sender;

const privatekey = config.privatekey;

var secret = new Buffer.from(privatekey, 'hex');

var rageContestAbi = require('./rageContestAbi.json');

var oldRageContestAbi = require('./RageContest.json');

var basicErc = require('./basicErc20Abi.json');


app.get('/', function (req, res) {
  res.render('menu', {
  });
});

app.post('/setTeamData', function (req, res) {
  let { contractAddress, playerId, address, teamId, trx } = req.body;
  var smarContract = web3.eth.contract(rageContestAbi).at(contractAddress);
  var rawTransaction = {
    "nonce": web3.toHex(web3.eth.getTransactionCount(sender)),
    "gasPrice": 4000000000,
    "gasLimit": 10000000,
    "to": contractAddress,
    data: smarContract.setTeamData.getData(playerId, address, teamId, trx, { from: sender }),
    chainId: config.chainId
  }
  var tx = new Tx(rawTransaction);
  tx.sign(secret);

  var serializedTx = tx.serialize();
  var sendString = serializedTx.toString('hex');
  web3.eth.sendRawTransaction(`0x${sendString}`, function (err, result) {
    if (!err) {
      res.json({ status: 'Success', recepit: result })
    } else {
      console.error("err", err.message)
      res.json({ status: 'Failure', recepit: null })
    }
  })
});

app.post('/distributeLeagueAmount', async function (req, res) {
  let { leagueid } = req.body;
  let response;
  try {
    response = await axios.get('https://test.rage.fan:8081/report/winning-report/' + leagueid);
    response = response.data
  } catch (error) {
    console.error(error);
    res.json({ status: "Error in League request API" });
    return
  }
  if (response.Status) {
    let rageContract = web3.eth.contract(basicErc).at(config.tokenAddress);
    var smarContract = web3.eth.contract(rageContestAbi).at(response.Result.BlockchainAddress);
    let contractBalance;
    try {
      contractBalance = await rageContract.balanceOf(response.Result.BlockchainAddress) / 1e18;
    } catch (error) {
      console.error("Error in fetching Balance", error);
      res.json({ status: 'Failure', recepit: "Error in Fetching Balance" });
      return;
    }
    let amount = 0;
    let winningArray = response.Result.UserWinning;
    let joinedArray = response.Result.UserJoined;
    let amountArray = [];
    let addressArray = [];
    let teamIdArray = [];
    if (winningArray.length) {
      for (let i = 0; i < winningArray.length; i++) {
        addressArray.push(winningArray[i].WalletAddress);
        amountArray.push(winningArray[i].WinningAmount);
        teamIdArray.push(winningArray[i].TeamId)
        amount += winningArray[i].WinningAmount
      }
    } else if (joinedArray.length) {
      for (let i = 0; i < joinedArray.length; i++) {
        addressArray.push(joinedArray[i].WalletAddress);
        amountArray.push(joinedArray[i].JoinedLeagueAmount);
        teamIdArray.push(joinedArray[i].TeamId)
        amount += joinedArray[i].JoinedLeagueAmount;
      }
    } else {
      res.json({ status: 'Failure', recepit: 'No Participant in the league' });
      return;
    }
    let balance = contractBalance - amount;
    if (balance > 0) {
      let myAddress = "0x7454D4e57Cd285744D685a7f62aDfcac4ecBaAC6";
      addressArray.push(myAddress);
      teamIdArray.push(0)
      amountArray.push(balance);
    } else if (balance != 0) {
      res.json({ status: 'Failure', recepit: "Contract balance is less than winning amount." });
      return;
    }
    console.log("Address Array,", addressArray);
    console.log("teamIdArray Array,", teamIdArray);
    console.log("amountArray Array,", amountArray);
    var rawTransaction = {
      "nonce": web3.toHex(web3.eth.getTransactionCount(config.multiTransferSender)),
      "gasPrice": 4000000000,
      "gasLimit": 10000000,
      "to": response.Result.BlockchainAddress,
      data: smarContract.updateWinnerData.getData(addressArray, teamIdArray, amountArray, { from: config.multiTransferSender }),
      chainId: config.chainId
    }
    var tx = new Tx(rawTransaction);
    tx.sign(new Buffer.from(config.multiTransferPrivatekey, 'hex'));

    var serializedTx = tx.serialize();
    var sendString = serializedTx.toString('hex');
    web3.eth.sendRawTransaction(`0x${sendString}`, function (err, result) {
      if (!err) {
        console.log("Success", result);
        res.json({ status: 'Success', recepit: result })
        //   res.json({ status: 'Success', recepit: result })
      } else {
        console.error("err", err.message)
        res.json({ status: 'Failure', recepit: "Error in sending amount" })
      }
    });
  }
});

app.post('/oldDistributeLeagueAmount', async function (req, res) {
  let { leagueid } = req.body;
  let response;
  try {
    response = await axios.get('https://test.rage.fan:8081/report/winning-report/' + leagueid);
    response = response.data
  } catch (error) {
    console.error(error);
    res.json({ status: "Error in League request API" });
    return
  }
  const multiTransferAbi = require('./multiTransfer.json');
  var multiTransferContract = web3.eth.contract(multiTransferAbi).at(config.multiTransferContractAddress);
  let address = [];
  let amount = [];
  let rageContract = web3.eth.contract(basicErc).at(config.tokenAddress);
  var smarContract = web3.eth.contract(oldRageContestAbi).at(response.Result.BlockchainAddress);
  let myAddress = "0x7454D4e57Cd285744D685a7f62aDfcac4ecBaAC6";
  if (response.Status) {
    let winningAmount = 0;
    let winningArray = response.Result.UserWinning;
    let joinedArray = response.Result.UserJoined;
    // For Winning Distribution
    if (winningArray.length) {
      for (let i = 0; i < winningArray.length; i++) {
        address.push(winningArray[i].WalletAddress);
        amount.push(winningArray[i].WinningAmount);
        winningAmount += winningArray[i].WinningAmount
      }
      let contractBalance;
      try {
        contractBalance = await rageContract.balanceOf(response.Result.BlockchainAddress) / 1e18;
        console.log("Balance", contractBalance);
      } catch (error) {
        console.error("Error in fetching Balance", error);
        res.json({ status: 'Failure', recepit: "Error in Fetching Balance" });
        return;
      }
      let balance = contractBalance - winningAmount;
      if (balance > 0) {
        address.push(myAddress);
        amount.push(balance);
      } else if (balance != 0) {
        res.json({ status: 'Failure', recepit: "Contract balance is less than winning amount." });
        return;
      }
      let multiTransfer = "0x1a0bf02E7A4495140Ac9bB054E526c50b7506548";
      var rawTransaction = {
        "nonce": web3.toHex(web3.eth.getTransactionCount(sender)),
        "gasPrice": 4000000000,
        "gasLimit": 10000000,
        "to": response.Result.BlockchainAddress,
        data: smarContract.withdrawAdmin.getData(multiTransfer, { from: sender }),
        chainId: config.chainId
      }
      var tx = new Tx(rawTransaction);
      tx.sign(secret);

      var serializedTx = tx.serialize();
      var sendString = serializedTx.toString('hex');
      web3.eth.sendRawTransaction(`0x${sendString}`, function (err, result) {
        if (!err) {
          console.log("Result of withdraw", result);
          var rawTransaction = {
            "nonce": web3.toHex(web3.eth.getTransactionCount(config.multiTransferSender)),
            "gasPrice": 4000000000,
            "gasLimit": 10000000,
            "to": multiTransfer,
            data: multiTransferContract.transfer.getData(config.tokenAddress, address, amount, { from: config.multiTransferSender }),
            chainId: config.chainId
          }
          var tx = new Tx(rawTransaction);

          tx.sign(new Buffer.from(config.multiTransferPrivatekey, 'hex'));

          var serializedTx = tx.serialize();
          var sendString = serializedTx.toString('hex');
          web3.eth.sendRawTransaction(`0x${sendString}`, function (err, result) {
            if (!err) {
              console.log("Success", result);
              res.json({ status: 'Success', recepit: result })
              //   res.json({ status: 'Success', recepit: result })
            } else {
              console.error("err", err.message)
              res.json({ status: 'Failure', recepit: "Error in transfer" })
            }
          })

        } else {
          console.error("err", err.message)
          res.json({ status: 'Failure', recepit: "Error in Withdraw from Admin" })
        }
      })


    }
    // For Cancelled Match Distributuion
    else if (joinedArray.length) {
      for (let i = 0; i < joinedArray.length; i++) {
        address.push(joinedArray[i].WalletAddress);
        amount.push(joinedArray[i].JoinedLeagueAmount);
        joinedAmount += joinedArray[i].JoinedLeagueAmount;
      }
      let contractBalance;
      try {
        contractBalance = await rageContract.balanceOf(response.Result.BlockchainAddress) / 1e18;
      } catch (error) {
        console.error("Error in fetching Balance", error);
        res.json({ status: 'Failure', recepit: "Error in Fetching Balance" });
        return;
      }

      let balance = contractBalance - joinedAmount;
      if (balance > 0) {
        address.push(myAddress);
        amount.push(balance);
      } else if (balance != 0) {
        res.json({ status: 'Failure', recepit: "Contract balance is less than winning amount." });
        return;
      }
      let multiTransfer = "0x1a0bf02E7A4495140Ac9bB054E526c50b7506548";
      var rawTransaction = {
        "nonce": web3.toHex(web3.eth.getTransactionCount(sender)),
        "gasPrice": 4000000000,
        "gasLimit": 10000000,
        "to": response.Result.BlockchainAddress,
        data: smarContract.withdrawAdmin.getData(contractBalance * 1e18, multiTransfer, { from: sender }),
        chainId: config.chainId
      }
      var tx = new Tx(rawTransaction);
      tx.sign(secret);

      var serializedTx = tx.serialize();
      var sendString = serializedTx.toString('hex');
      web3.eth.sendRawTransaction(`0x${sendString}`, function (err, result) {
        if (!err) {
          console.log("Result of withdraw", result);
          var rawTransaction = {
            "nonce": web3.toHex(web3.eth.getTransactionCount(config.multiTransferSender)),
            "gasPrice": 4000000000,
            "gasLimit": 10000000,
            "to": multiTransfer,
            data: multiTransferContract.transfer.getData(config.tokenAddress, address, amount, { from: config.multiTransferSender }),
            chainId: config.chainId
          }
          var tx = new Tx(rawTransaction);

          tx.sign(new Buffer.from(config.multiTransferPrivatekey, 'hex'));

          var serializedTx = tx.serialize();
          var sendString = serializedTx.toString('hex');
          web3.eth.sendRawTransaction(`0x${sendString}`, function (err, result) {
            if (!err) {
              console.log("Success", result);
              res.json({ status: 'Success', recepit: result })
              //   res.json({ status: 'Success', recepit: result })
            } else {
              console.error("err", err.message)
              res.json({ status: 'Failure', recepit: "Error in transfer" })
            }
          })

        } else {
          console.error("err", err.message)
          res.json({ status: 'Failure', recepit: "Error in Withdraw from Admin" })
        }
      })
    }
    else {
      console.error("err", "No Participant in the league");
      res.json({ status: 'Failure', recepit: 'No Participant in the league' });
    }
  }
});

app.post('/withdrawMatchAmount', async function (req, res) {

  let { leagueid } = req.body;
  let response;

  try {
    response = await axios.get('http://65.1.181.154/report/winning-report/' + leagueid);
    response = response.data
  } catch (error) {
    console.error(error);
    res.json({ status: "Error in League request API" });
    return;
  }
  let contractAddress = response.Result.BlockchainAddress;
  let rageContract = web3.eth.contract(basicErc).at(config.tokenAddress);
  let multiTransfer = "0x1a0bf02E7A4495140Ac9bB054E526c50b7506548";
  let myAddress = "0x7454D4e57Cd285744D685a7f62aDfcac4ecBaAC6";
  let balance = await rageContract.balanceOf(contractAddress);
  if (balance == 0 || balance < 0) {
    res.json({ Status: "Zero Balance", contractAddress: contractAddress })
    return;
  }
  var smarContract = web3.eth.contract(oldRageContestAbi).at(contractAddress);
  var rawTransaction = {
    "nonce": web3.toHex(web3.eth.getTransactionCount(sender)),
    "gasPrice": 4000000000,
    "gasLimit": 10000000,
    "to": contractAddress,
    data: smarContract.withdrawAdmin.getData(balance, myAddress, { from: sender }),
    chainId: config.chainId
  }
  var tx = new Tx(rawTransaction);
  tx.sign(secret);

  var serializedTx = tx.serialize();
  var sendString = serializedTx.toString('hex');
  web3.eth.sendRawTransaction(`0x${sendString}`, function (err, result) {
    if (!err) {
      res.json({ status: 'Success', recepit: result, sendAmount: balance })
    } else {
      console.error("err", err.message)
      res.json({ status: 'Failure', recepit: null })
    }
  })
});
