const rageContest = artifacts.require("./RageContest.sol");
const rageFactory = artifacts.require("./RageFactory.sol");
const rageToken = artifacts.require("./RageToken.sol");

module.exports = function(deployer, network, accounts) {

  //  const ownerAddress = '0x508D3a0E42f04B1103e3684972A45F29C53d785b';
  //  const libarayAddress = '0x2420Ed7B7d99d1f4E2568C7321899a92B10c9e22';
  //  deployer.deploy(rageFactory, ownerAddress, libarayAddress);
  deployer.then( async () => {
    try {
      // deploy and link MessagesAndCodes lib for MessagedERC1404's    
     
     const ownerAddress = '0x508D3a0E42f04B1103e3684972A45F29C53d785b';
     const tokenAddress = "0xb17A9A058F05573bF820601E3A6CC968bE39b495"
    // const ownerAddress = accounts[0];

    //  await deployer.deploy(rageToken);
     // const token  = await rageToken.deployed();

      await deployer.deploy(rageContest, ownerAddress, token.address);

      const libarayAddress = await rageContest.deployed();

      // await deployer.deploy(rageFactory, ownerAddress, libarayAddress.address );

      // const rageFactoryContract = await rageFactory.deployed();
      
    } catch (err) {
      console.log(('Failed to Deploy Contracts', err))
    }
  })

};