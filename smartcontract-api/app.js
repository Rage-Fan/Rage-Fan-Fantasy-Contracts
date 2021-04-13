
var express = require('express'), 
app = module.exports = express();

app.set('view engine', 'ejs');
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');


// Require body-parser (to receive post data from clients)
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


if (!module.parent) {
    app.listen( 3000 )
    console.log('Running in port 3000');
}


Web3 = require('web3')
web3 = new Web3(new Web3.providers.HttpProvider("https://rpc-mumbai.maticvigil.com/"));

//web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io"));
var contractAddress = "0x78643f1890aeA6d3944feC4952e5005f6E256f06"
//"0x7aAeE0875C13494c72D16443A968821a03aF94B1";
var abiDefinition = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_adminOwner",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_id",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_startTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_endTime",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_contestTitle",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_contestFees",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_winningAmount",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "_isActive",
        "type": "bool"
      },
      {
        "internalType": "address",
        "name": "_token",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "ApprovePlay",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "ContestCanceled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "_id",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_startTime",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_endTime",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "_contestTitle",
        "type": "string"
      }
    ],
    "name": "ContestCreatedEvent",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "LogPlay",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "withdrawer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "LogWithdrawal",
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
    "inputs": [],
    "name": "PlayerDataUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "WinnersDataUpdated",
    "type": "event"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "canceled",
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
    "name": "contestFees",
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
    "name": "contestId",
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
    "name": "contestTitle",
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
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "contestants",
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
    "constant": true,
    "inputs": [],
    "name": "decimals",
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
    "name": "endTime",
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
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "fundsByParticipants",
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
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "fundsByWinnersByTeam",
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
    "name": "getChainID",
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
    "constant": true,
    "inputs": [],
    "name": "isActive",
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
    "name": "maxContestants",
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
    "name": "minContestants",
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
    "constant": true,
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "participantsByTeam",
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
    "name": "player",
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
    "constant": true,
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "players",
    "outputs": [
      {
        "internalType": "string",
        "name": "id",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "points",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "captain",
        "type": "string"
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
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "playersData",
    "outputs": [
      {
        "internalType": "string",
        "name": "id",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "points",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "captain",
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
    "name": "prizePool",
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
    "name": "settled",
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
    "name": "startTime",
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
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "winnersTeamIDAddress",
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
    "constant": true,
    "inputs": [],
    "name": "winningAmount",
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
    "inputs": [],
    "name": "callContest",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_teamId",
        "type": "uint256"
      }
    ],
    "name": "withdraw",
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
        "name": "_amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_teamId",
        "type": "uint256"
      }
    ],
    "name": "withdrawWinningAmount",
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
        "name": "_value",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_teamId",
        "type": "uint256"
      }
    ],
    "name": "playNow",
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
        "internalType": "address[]",
        "name": "_winners",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "_teamId",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "_amount",
        "type": "uint256[]"
      }
    ],
    "name": "updateWinnersData",
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
        "internalType": "uint256[]",
        "name": "_playerIds",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "_points",
        "type": "uint256[]"
      }
    ],
    "name": "updatePlayerPoints",
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
        "internalType": "bool",
        "name": "status",
        "type": "bool"
      }
    ],
    "name": "cancelContest",
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
];

var smartContract = web3.eth.contract(abiDefinition).at(contractAddress);
console.log("smart contract function...", smartContract.canceled());
// settled


app.get('/', function(req, res){
    res.render('menu', { 
      });
  });


  app.get('/cancelled', function(req, res){
    res.json(smartContract.canceled())
  });

  app.get('/settled', function(req, res){
    res.json(smartContract.settled())
  });
  

  app.get('/cancel', function(req, res){
    // true - cancel contrct
    // false - not cancelled


    res.json(smartContract.settled())
  });
  

app.get('/updateWinnersData', function(req, res){

  addresses = [0xb7fBcde5041b5a3Bf55783aCA8Fe7d8b854c0c51, 0x6b175474e89094c44da98b954eedeac495271d0f ]
  teamids   =[1001,1002]
  amount = [150000000000,12000000]

  smartContract.updateWinnersData
  });

  

app.post('/entry', function(req, res){
      console.log("Body...", req.body);
      
      rollNo = parseInt(req.body.RollNo);
      name = req.body.Name;
      year = req.body.Year;
      result = req.body.Result;
      //console.log(req.body);

      smartContract.putCertificateData( rollNo, name, year, result,
                                        {from:web3.eth.accounts[0], gas:3000000},
                                        function(err, txn){

                                if (err) 
                                    message = "Error occured.." 
                                 else 
                                    message = "Saved successfully.. Txn Ref : " + txn          
                                
                                res.render('entry', { 
                                      rollNo: rollNo ,
                                      name: name,
                                      year: year,
                                      result: result,
                                      message: message
                                }); //render

      }); //smartcontract

  }); 


app.get('/view', function(req, res){
    res.render('view', { 
          rollNo: "",
          name: "",
          year: "",
          result: "",
          message: ""
      });
  });


app.post('/view', function(req, res){
      console.log("Roll No", parseInt(req.body.RollNo));

      rollNo = parseInt(req.body.RollNo);

      var certificateData = smartContract.getCertificateData(rollNo)
      
      console.log(certificateData);
      certificateData[3] = rollNo;
      var message = null;

        if (certificateData[0] == "") 
         { 
           message = "Record not found"
         }
     
        console.log(certificateData);

      res.render('view', { 
            rollNo: rollNo ,
            name: certificateData[0],
            year: certificateData[1],
            result: certificateData[2],
            message: message
        });
  });


app.get('/list', function(req, res){
  smartContract.listCertificatesCount( function(err, count) 
  {
        countCertificates = count.toNumber()
        console.log("count...", countCertificates );
        
        var certificatesArray = [];

        for(i=0; i<countCertificates; i++)
        {
          var rollNo = smartContract.certificateAtIndex(i).toNumber();
          var certificateData = smartContract.getCertificateData(rollNo)
          certificateData[3] = rollNo;
          console.log(certificateData);
          certificatesArray.push(certificateData);
        }
        res.render('list', { 
            certificates: certificatesArray
        });
  });

});