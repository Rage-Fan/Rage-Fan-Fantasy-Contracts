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

contract RageFactory is Ownable {
    address[] public contests;

    event ContestCreated(string  name, address tokenAddress);

    function createNewContest(string memory _name, string memory _id, uint _startTime, 
                              uint _endTime
                            )
                            onlyOwner
                            public returns (address) {


                RageContest newContest = new RageContest(_name, _id, _startTime, _endTime);
                contests.push(address(newContest));

                emit ContestCreated(_name, address(newContest));
        }
}