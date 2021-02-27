pragma solidity 0.5.0;

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
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */

library SafeMath {

  /**
  * @dev Multiplies two numbers, throws on overflow.
  */
  function mul(uint256 a, uint256 b) internal pure returns (uint256 c) {
    if (a == 0) {
      return 0;
    }
    c = a * b;
    assert(c / a == b);
    return c;
  }

  /**
  * @dev Integer division of two numbers, truncating the quotient.
  */
  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    // uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return a / b;
  }

  /**
  * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  /**
  * @dev Adds two numbers, throws on overflow.
  */
  function add(uint256 a, uint256 b) internal pure returns (uint256 c) {
    c = a + b;
    assert(c >= a);
    return c;
  }
}



/**
 * @title Fantasy Contest
 * @dev 
 * @dev 
 */


contract RageContest  {

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
    address  public owner; 
    address[] public contestants; 
    

    struct Player {
      string id; 
      string name;
      string points;
      string captain;  //C,VC,P  
    }

    event ContestCanceled();

    /*
    * Contract Constructor
    */
    constructor(string memory _name, string memory _id, uint _startTime, uint _endTime,   address _issuer) public {
        name      = _name;
        contestId = _id;
        startTime = _startTime;
        endTime   = _endTime;
        owner     = _issuer;
      
    }

    function withdraw()
        public pure
        // onlyEndedOrCanceled
       returns (bool success)
        {
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

 modifier onlyOwner {
        assert (msg.sender == owner) ;
        _;
    }

    modifier onlyNotOwner {
        require (msg.sender != owner) ;
        _;
    }

    modifier onlyAfterStart {
        require (block.timestamp > startTime) ;
        _;
    }

    modifier onlyBeforeEnd {
        require (block.timestamp < endTime) ;
        _;
    }

    modifier onlyNotCanceled {
        require (!canceled) ;
        _;
    }

    modifier onlyEndedOrCanceled {
        require (block.timestamp > endTime || canceled) ;
        _;
    }
}