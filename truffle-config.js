/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */

const HDWalletProvider = require("@truffle/hdwallet-provider");
const mnemonic = "sustain wrestle save dizzy luggage inherit elephant mule lecture pupil salon grass";

const Web3 = require("web3");
const web3 = new Web3();

//const PrivateKeyProvider = require("@truffle/hdwallet-provider");
//const privateKey = "efbe463639c2a70be3371e846baee0240a9ae1ba0d67d51b30ea62ca8117cc7e";

module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    // to customize your Truffle configuration!
    networks: {
      development: {
        host: "127.0.0.1",
        port: 8545,
        network_id: "*", // Match any network id,
        gas: 6721975,
        gasPrice: 10000000000,
      },
      matic: {
          provider: function() { 
             return new HDWalletProvider(mnemonic, 'https://rpc-mumbai.maticvigil.com/v1/3318488deee982b52a9b1d1d7d9751725f1d3b29') 
            },
            network_id: '80001',
            gasPrice: '1000000000',
            confirmations: 5,
        //    timeoutBlocks: 200,
            skipDryRun: false
      },    
      // ropsten: {
      //   provider: function() { 
      //      return new HDWalletProvider(mnemonic, 'https://ropsten.infura.io/v3/37152c09b8694a7fbb020aac72c57a70') 
      //     },
      //     network_id: '3',
      //     gas: 6721975,
      //     gasPrice: 10000000000,
      //     confirmations: 2,
      //     timeoutBlocks: 200,
      //     skipDryRun: false 
      //  },          
      //  mainnet: {
      //   provider: function() { 
      //     return new PrivateKeyProvider(privateKey, 'https://mainnet.infura.io/v3/37152c09b8694a7fbb020aac72c57a70') 
      //   },
      //   network_id: '1',
      //   gasPrice: web3.utils.toWei('41', 'gwei'), 
      //   confirmations: 2,              
      //   skipDryRun: true 
      // }
    },
    // Configure your compilers
    compilers: {
      solc: {
        version: '0.6.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  };
  