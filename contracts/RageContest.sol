pragma solidity 0.5.0;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

/**
 * Name    : Rage Contest smart contract for managing a contest  
 * Company : Rage.Fan 
 * Author  : Saravana Malaichami (saravana at rage.fan)
 * Date    : 20-Feb-2021
 * Version : 0.1 
 */

contract TokenInterface {
    function transfer(address _to, uint256 _value) public returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool);
    function balanceOf(address who) public view returns (uint256);
    function allowance(address owner, address spender)  public view returns (uint256);
    function approve(address _spender, uint256 _value) external returns (bool success);
}


/**
 * @title Fantasy Contest
 * @dev 
 * @dev 
 */

contract RageContest is Ownable {

    string public  contestId;
    string public  name;
    Player[] public players;

    uint public entryFree;
    uint public prizePool;
    uint public decimals;
    uint public maxContestants;
    uint public minContestants;
    uint public startTime;
    uint public endTime;
    bool public canceled;  
    bool public settled; 
    address  public player; 
    address[] public contestants; 
    
    struct Player {
      string id; 
      string name;
      string points;
      string captain;  //C,VC,P  
    }

    mapping(address => uint256) public fundsByParticipants;
    mapping(address => uint256) public fundsByWinners;

    event ContestCanceled();
    event LogPlay(address player);

    /*
    * Contract Constructor
    */
    constructor(string memory _name, string memory _id, uint _startTime, uint _endTime, address _tokenAddress) public {
        name      = _name;
        contestId = _id;
        startTime = _startTime;
        endTime   = _endTime;

        token = TokenInterface(_tokenAddress);
        
    }

function withdraw()
        public pure
        onlyEndedOrCanceled
        returns (bool success)
        {
            return true;
        }

function withdrawWinningAmount()
        public pure
        onlyAfterEnd 
        onlyNotCanceled
        onlyAfterSettlement
        returns (bool success)
        {
            return true;
        }

      
function playNow(uint _value)
        public
        onlyBeforeStart
        onlyNotCanceled
        returns (bool success)
        {
        
        require (_value != 0);
        require (_value > 0);
        
        require(token.balanceOf(msg.sender) > _value);
        require(token.transferFrom(msg.sender, this, _value));

        // calculate the user's total bid based on the current amount they've sent to the contract
        // plus whatever has been sent with this transaction
        
        fundsByParticipants[msg.sender] = fundsByParticipants[msg.sender] + _value;

        emit LogPlay(msg.sender);
        return true;
    }

         
function changeTeam(uint _value)
        public
        onlyBeforeStart
        onlyNotCanceled
        returns (bool success)
        {
        
        require (_value != 0);
        require (_value > 0);
        
        require(token.balanceOf(msg.sender) > _value);
        require(token.transferFrom(msg.sender, this, _value));

        // calculate the user's total bid based on the current amount they've sent to the contract
        // plus whatever has been sent with this transaction
        
        fundsByParticipants[msg.sender] = fundsByParticipants[msg.sender] + _value;

        emit LogPlay(msg.sender);
        return true;
    }


 function updateWinningData(address[] _winnners, uint256[] memory _amount)
        public
        onlyOwner
        onlyAfterEnd
        onlyNotCanceled
        returns (bool success)
    {
        //
        // update the winning address with
        // winning amount 
        // 
        
        for (i=0; i<_winners.length; i++) {
            fundsByWinners[_winners[i]] = _amount[i];
        }
       
        emit winningDataUpdated();
        return true;
    }


 function playerPoints(address[] _players, uint[] memory _points)
        public
        onlyOwner
        onlyAfterEnd
        onlyNotCanceled
        returns (bool success)
    {
        //
        // update the winning address with
        // winning amount 
        // 
        
        for (i=0; i<_players.length; i++) {
            _players[i] = _points[i];
        }
       
        emit winningDataUpdated();
        return true;
    }


    // function getContestants ()
    //     view
    //     public
    //     returns(memory address[])
    //     {
    //         return contestants;
    //     }
      
function cancelContest()
        public
        onlyOwner
        onlyBeforeEnd
        onlyNotCanceled
        returns (bool success)
    {
        canceled = true;

        emit ContestCanceled();
        return true;
    }


//     modifier onlyNotOwner {
//         require (msg.sender != owner) ;
//         _;
//     }

    modifier onlyAfterStart {
        require (block.timestamp > startTime) ;
        _;
    }

    modifier onlyBeforeStart {
        require (block.timestamp < startTime) ;
        _;
    }

    modifier onlyBeforeEnd {
        require (block.timestamp < endTime) ;
        _;
    }

    modifier onlyAfterEnd {
        require (block.timestamp > endTime) ;
        _;
    }

    modifier onlyNotCanceled {
        require (!canceled) ;
        _;
    }

    modifier onlyAfterSettlement {
        require (settled) ;
        _;
    }

    modifier onlyEndedOrCanceled {
        require (block.timestamp > endTime || canceled) ;
        _;
    }
}