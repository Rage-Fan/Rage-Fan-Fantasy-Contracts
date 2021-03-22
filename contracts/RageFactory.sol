pragma solidity 0.5.16;

/**
 * Name    : Rage Factory Contract for managing contests smart contracts 
 * Company : Rage.Fan 
 * Author  : Saravana Malaichami (saravana at rage.fan)
 * Date    : 20-Feb-2021
 * Version : 0.1 
 */

import { RageContest } from './RageContest.sol';
import "./EIP712MetaTransaction.sol";
import "./CloneFactory.sol";

/**
* Chain id = 80001 is matic Mumbai test net rpc-mumbai. need to change for main net 
*/
contract RageFactory is CloneFactory,  EIP712MetaTransaction {
    address[] public contests;
    address private  owner;

    address public libraryAddress;

    event ContestCreated(string name, address newContest);

    constructor(address _adminOwner, address _libraryAddress) 
    public 
    EIP712MetaTransaction("RageFactoryContract","1", 80001)
    {
       owner = _adminOwner;
       libraryAddress = _libraryAddress;
    }

    function onlyCreate() public {
        createClone(libraryAddress);
    }

    function createNewContest(string memory _id, string memory _name,  uint _startTime, 
                              uint _endTime, string memory _contestTitle, uint256 _contestFees, 
                              uint256 _winningAmount, bool _isActive, address _tokenAddress
                            )
                            public {

                   address clone = createClone(libraryAddress);
                   RageContest(clone).init(_id, _name, _startTime, _endTime,
                                                          _contestTitle,
                                                          _contestFees,
                                                          _winningAmount,
                                                          _isActive,
                                                          _tokenAddress, owner); 
                               
                contests.push(address(clone));

                emit ContestCreated(_name, address(clone));
        }

      function getContests() external view returns (address[] memory) {
        return contests;
      }


        modifier onlyOwner {
        assert (msgSender() == owner) ;
        _;
    }

}