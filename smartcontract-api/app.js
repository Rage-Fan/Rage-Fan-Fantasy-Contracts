const express = require('express');

const Tx = require('ethereumjs-tx');

const config = require('./config.js');

app = module.exports = express();


app.set('view engine', 'ejs');
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded({ extended: true })); //Parse URL-encoded bodies


if (!module.parent) {
  app.listen(3000)
  console.log('Running in port 3000');
}
Web3 = require('web3')

const web3 = new Web3(new Web3.providers.HttpProvider(config.rpcUrl));

let sender = config.sender;

const privatekey = config.privatekey;

var secret = new Buffer.from(privatekey, 'hex');

var rageContestAbi = require('./rageContestAbi.json');


app.get('/', function (req, res) {
  res.render('menu', {
  });
});

app.post('/setTeamData', function (req, res) {
  let {contractAddress, playerId, address, teamId,trx} = req.body;
  var smarContract = web3.eth.contract(rageContestAbi).at(contractAddress);
  var rawTransaction = {
    "nonce": web3.toHex(web3.eth.getTransactionCount(sender)),
    "gasPrice": 4000000000,
    "gasLimit": 10000000,
    "to": contractAddress,
    data: smarContract.setTeamData.getData(playerId,address,teamId,trx, { from: sender }),
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