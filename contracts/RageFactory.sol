pragma solidity 0.5.0;

/**
 * Name    : Rage Factory Contract for managing contests smart contracts 
 * Company : Rage.Fan 
 * Author  : Saravana Malaichami (saravana at rage.fan)
 * Date    : 20-Feb-2021
 * Version : 0.1 
 */

import "@openzeppelin/contracts/ownership/Ownable.sol";
import { RageContest } from './RageContest.sol';

contract RageFactory  {
    address[] public contests;
    address public  owner;

    event ContestCreated(string  name, address contestAddress);

    function createNewContest(string memory _id, string memory _name,  uint _startTime, 
                              uint _endTime, string memory _contestTitle, uint256 _contestFees, 
                              uint256 _winningAmount, bool _isActive, address _tokenAddress
                            )
                            onlyOwner
                            public returns (address) {


                RageContest newContest = new RageContest( _id, _name, _startTime, _endTime,
                                                          _contestTitle,
                                                          _contestFees,
                                                          _winningAmount,
                                                          _isActive,
                                                          _tokenAddress
                                                        );
                contests.push(address(newContest));

                emit ContestCreated(_name, address(newContest));
        }

        modifier onlyOwner {
        assert (msg.sender == owner) ;
        _;
    }

}