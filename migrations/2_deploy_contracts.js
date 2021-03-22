const rageContest = artifacts.require("./RageContest.sol");
const rageFactory = artifacts.require("./RageFactory.sol");
module.exports = function(deployer, network, accounts) {

  //  const ownerAddress = '0x508D3a0E42f04B1103e3684972A45F29C53d785b';
  //  const libarayAddress = '0x2420Ed7B7d99d1f4E2568C7321899a92B10c9e22';
  //  deployer.deploy(rageFactory, ownerAddress, libarayAddress);
  deployer.then( async () => {
    try {
      // deploy and link MessagesAndCodes lib for MessagedERC1404's    
     
     const ownerAddress = '0x508D3a0E42f04B1103e3684972A45F29C53d785b';
      await deployer.deploy(rageContest, ownerAddress);

      const libarayAddress = await rageContest.deployed();

      await deployer.deploy(rageFactory, ownerAddress, libarayAddress.address );

      const rageFactoryContract = await rageFactory.deployed();
      
    } catch (err) {
      console.log(('Failed to Deploy Contracts', err))
    }
  })

};