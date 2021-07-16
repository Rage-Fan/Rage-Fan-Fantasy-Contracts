pragma solidity 0.5.16;

/**
 * Name    : Rage Factory Contract for managing contests smart contracts
 * Company : Rage.Fan
 * Author  : Saravana Malaichami (saravana at rage.fan)
 * Date    : 20-Feb-2021
 * Version : 0.1
 */

import {RageContest} from "./RageContest.sol";

contract RageFactory {
    address[] public contests;
    address public owner;

    event ContestCreated(string name, address contestAddress);

    // rageContest, ownerAddress, "59", "140 Trage", 1618491600, 1618495200000, "Oeiras vs Miranda Dragons (Safe)", 10, 140, true, tokenAddress

    function createNewContest(
        address _ownerAddress,
        address _creator,
        string memory _id,
        string memory _name,
        uint256 _startTime,
        uint256 _endTime,
        string memory _contestTitle,
        uint256 _contestFees,
        uint256 _minimumPlayer,
        uint256 _maximumPlayer,
        address _tokenAddress
    )
        public
        returns (
            // onlyOwner
            address
        )
    {
        RageContest newContest = new RageContest(
            _ownerAddress,
            _creator,
            _id,
            _name,
            _startTime,
            _endTime,
            _contestTitle,
            _contestFees,
            _minimumPlayer,
            _maximumPlayer,
            _tokenAddress
        );
        contests.push(address(newContest));

        emit ContestCreated(_name, address(newContest));
        return address(newContest);
    }

    //     modifier onlyOwner {
    //     assert (msg.sender == owner) ;
    //     _;
    // }
}
