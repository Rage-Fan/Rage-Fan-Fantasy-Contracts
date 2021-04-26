  
var Factory = artifacts.require('./RageFactory.sol');

module.exports = function(deployer) {
  deployer.deploy(Factory);
};