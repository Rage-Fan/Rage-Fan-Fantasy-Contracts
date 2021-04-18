pragma solidity 0.5.16;

/**
 * Name    : Rage Factory Contract for managing contests smart contracts
 * Company : Rage.Fan
 * Author  : Saravana Malaichami (saravana at rage.fan)
 * Date    : 20-Feb-2021
 * Version : 0.1
 */

import {RageContest} from "./RageContest.sol";
import "./EIP712MetaTransaction.sol";
import "./CloneFactory.sol";

/**
 * Chain id = 80001 is matic Mumbai test net rpc-mumbai. need to change for main net
 */
contract RageFactory is CloneFactory, EIP712MetaTransaction {
    RageContest[] public contests;
    address private owner;

    address public libraryAddress;

    event ContestCreated(string name, address newContest);

    constructor(address _adminOwner, address _libraryAddress)
        public
        EIP712MetaTransaction("RageFactoryContract", "1", 80001)
    {
        owner = _adminOwner;
        libraryAddress = _libraryAddress;
    }

    function onlyCreate() public {
        createClone(libraryAddress);
    }

    function createNewContest(
        string memory _name
        // string memory _id,
        // uint256 _startTime,
        // uint256 _endTime,
        // string memory _contestTitle,
        // uint256 _contestFees,
        // uint256 _winningAmount,
        // bool _isActive,
        // address _token
    ) public {
        RageContest clone = RageContest(createClone(libraryAddress));
        /*
                   clone.init(_id, _name, _startTime, _endTime,
                                                          _contestTitle,
                                                          _contestFees,
                                                          _winningAmount,
                                                          _isActive,
                                                          _token); 
                    */

        contests.push(clone);

        emit ContestCreated(_name, address(clone));
    }

    function getContests() external view returns (RageContest[] memory) {
        return contests;
    }

    modifier onlyOwner {
        assert(msgSender() == owner);
        _;
    }
}
