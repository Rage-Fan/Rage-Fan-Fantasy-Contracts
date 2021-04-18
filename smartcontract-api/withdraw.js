Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider("https://rpc-mumbai.maticvigil.com/"));
const Tx = require('ethereumjs-tx')
const rageCoinContract = "0xb17A9A058F05573bF820601E3A6CC968bE39b495";
const abiDefinition = require('./rageContestAbi.json');
const abi = require('./basicErc20Abi.json');
const erc = web3.eth.contract(abi).at(rageCoinContract);
const sender = "0x508d3a0e42f04b1103e3684972a45f29c53d785b";
const privatekey = '7aa1abed6634e14fbcbdfbce6f7100be17574d8a82a7c9698d7b04b214aaec01';
const secret = new Buffer(privatekey, 'hex');
var cAddress = [
    { BlockchainAddress: '0x56Ee83A5d9D7EF2C2cDAD0CC5180185EA516Aa5a' },
    { BlockchainAddress: '0x2F8f9279af1D6Bc774Eb4EcbB4b0ECf2419E5276' },
    { BlockchainAddress: '0x032fC0cCcdbA7F0C553d7055Ab65eFa057Bcb6B3' },
    { BlockchainAddress: '0xf72588DB6023eC39860B990adBff689092F60Ab2' },
    { BlockchainAddress: '0xb278560522eE5CD14860d40F808c1F93144C9883' },
    { BlockchainAddress: '0x9146Ce541B7FB21cB0F4f6e0b08064513826D77A' },
    { BlockchainAddress: '0xf72588DB6023eC39860B990adBff689092F60Ab2' },
    { BlockchainAddress: '0x032fC0cCcdbA7F0C553d7055Ab65eFa057Bcb6B3' },
    { BlockchainAddress: '0xb278560522eE5CD14860d40F808c1F93144C9883' },
    { BlockchainAddress: '0x94d4802f347e4D6dF40B6574493d768CA17ECa38' },
    { BlockchainAddress: '0x31f2A56955740110b0f994702e9c0c01AE9C866e' },
    { BlockchainAddress: '0xB6c0EDC1Dd70c0E9439a14B5Dc34c39B9b15f3Fb' },
    { BlockchainAddress: '0xBF50d1Dd3D8518eA649207239367959dB1B12E28' },
    { BlockchainAddress: '0x1b25CFDaE889ceE1B1127c0DCA1816B99d240Bf7' },
    { BlockchainAddress: '0xb8e50942ca4e31300934D403A0Be9189C91197CD' },
    { BlockchainAddress: '0x070eC10Ec05e7435EE7416F7B2b9a2640f4E14CC' },
    { BlockchainAddress: '0xcca5106aFfb56D9F9F821F5DD9D1facFED8c1492' },
    { BlockchainAddress: '0x92eeF12e1657Af6191fFe19fb8c81cF46E6a2761' },
    { BlockchainAddress: '0x8681363f5CC1771c32C609e5CB728D391B80f4fe' },
    { BlockchainAddress: '0x1F3A31fd979f0D01F79616E2B668Ee41d50Cd598' },
    { BlockchainAddress: '0xD8176788d9BAC0af7279e1BEF8C4ABAe1CA93491' },
    { BlockchainAddress: '0xFbA918D19110Fbd2dD5f8b9A8FFb2c1fa6a192Af' },
    { BlockchainAddress: '0x700d68fb556e986615a0D62e4b42fE1403f341eB' },
    { BlockchainAddress: '0x0c40DAab2D53f9FDc568f8b1cda075113c637E7A' },
    { BlockchainAddress: '0xD9D9844b90c43fA0065497421AFDd693d1f7f0E8' },
    { BlockchainAddress: '0x9aD6f732756e55C238FfFa2aC2D215cF92fE1071' },
    { BlockchainAddress: '0xe0FDb20C75f6485E2000593E32fE8bCaAA2ca652' },
    { BlockchainAddress: '0x6684380dB3Be8c41Da3b9805246C5704195EB245' },
    { BlockchainAddress: '0x9a1c486b8f86c09Adf9AC5bB13C7239bab26fd33' },
    { BlockchainAddress: '0xf61d8dC92c937Fc4447451DDBdCaD7EfE0f85de0' },
    { BlockchainAddress: '0x65c5a4db526EA25E4FDb2a50f1BB4d1e720A9745' },
    { BlockchainAddress: '0xC4eB8Fc0eD9053d12019BF4D02a45cA1Be5d6AE0' },
    { BlockchainAddress: '0x338a8Ce905EE5462426A47DebB2f4E4F4606638f' },
    { BlockchainAddress: '0x9442222c5f250ED87EfD1919Da65311f93c5e4Ba' },
    { BlockchainAddress: '0xE96CFC368839cC40f00b904abA9232aA222BC852' },
    { BlockchainAddress: '0x99dDCF108c8DB751c8Fe35c3EF1653c4428E4bf1' },
    { BlockchainAddress: '0x3Bf35C271c07E42a5e23994669bfA0F1fBA44eA8' },
    { BlockchainAddress: '0x973F6A43dB9B23491254c52f91de8CB709FF1ccd' }];
    exec();
async function exec() {
    for (let i = 0; i < 2; i++) {
        let value = await erc.balanceOf(cAddress[i]['BlockchainAddress']) / 1e18;
        if (value > 0) {
            console.log(cAddress[i]['BlockchainAddress'] + ": " + value)
            await sendTo(value, cAddress[i]['BlockchainAddress']);
        }

    }
}

async function sendTo(value, cAddress) {
    var smartContract = web3.eth.contract(abiDefinition).at(cAddress);
    var rawTransaction = {
        "nonce": web3.toHex(web3.eth.getTransactionCount(sender)),
        "gasPrice": web3.toHex(web3.toWei('20', 'gwei')),
        "gasLimit": 100000,
        "to": cAddress,
        // "value": '0x00',
        data: smartContract.withdrawAdmin.getData(value * 1e18, '0x7454D4e57Cd285744D685a7f62aDfcac4ecBaAC6', { from: sender }),
        chainId: 80001
    }
    var tx = new Tx(rawTransaction);
    tx.sign(secret);

    var serializedTx = tx.serialize();
    var sendString = serializedTx.toString('hex');
    console.log("Sumbited For " + cAddress);
    return web3.eth.sendRawTransaction(`0x${sendString}`, async function (err, result) {
        if (!err) {
            var txhas = result;
            console.log(txhas);
            return
            // res.json({ status: 'Success', recepit: result })
        } else {
            console.log("err", err.message)
            return
            // res.json({ status: 'Failure', recepit: null })
        }
    })

}