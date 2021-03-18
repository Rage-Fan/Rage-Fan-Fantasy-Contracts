pragma solidity 0.5.0;

// import "@openzeppelin/contracts/ownership/Ownable.sol";
 import "@openzeppelin/contracts/math/SafeMath.sol";

/**
 * Name    : Rage Contest smart contract for managing a contest  
 * Company : Rage.Fan 
 * Author  : Saravana Malaichami (saravana at rage.fan)
 * Date    : 20-Feb-2021
 * Version : 0.1 
 */

// interface TokenInterface {
//     function transfer(address _to, uint256 _value) public returns (bool success);
//     function transferFrom(address _from, address _to, uint256 _value) public returns (bool);
//     function balanceOf(address who) public view returns (uint256);
//     function allowance(address owner, address spender)  public view returns (uint256);
//     function approve(address _spender, uint256 _value) external returns (bool success);
// }

interface TokenInterface {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * @title Fantasy Contest
 * @dev 
 * @dev 
 */

contract RageContest  {
 
    TokenInterface public token;

    string public  contestId;
    string public  name;
    string public contestTitle;
    uint256 public contestFees;
    uint256 public winningAmount;
 
    bool public isActive;
    address public owner;
    

    Player[] public players;

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
      uint points;
      string captain;  //C,VC,P  
    }

    mapping (uint => Player) public playersData;
    mapping (uint => bool) internal playersList;

    mapping (address => uint256) public fundsByParticipants;
    mapping (address => uint256) public fundsByWinners;
    mapping (address => bool) public participantsList;

    event ContestCanceled();
    event LogPlay(address player);

    event PlayerDataUpdated();
    event LogWithdrawal(address withdrawer,  uint amount);

    /*
    * Contract Constructor
    */
    constructor(string memory _id, string memory _name,  uint _startTime, uint _endTime, 
                string memory _contestTitle,
                uint256 _contestFees, 
                uint256 _winningAmount, 
                bool _isActive,
                address _tokenAddress) public {
        
                contestId       =   _id;
                name            =   _name;
                startTime       =   _startTime;
                endTime         =   _endTime;
                contestTitle    =   _contestTitle;
                contestFees     =   _contestFees;
                winningAmount   =   _winningAmount;
                isActive        =   _isActive;
                owner = msg.sender;            
                token = TokenInterface(_tokenAddress);
        
    }

function withdraw(uint256 _amount)
        public 
        onlyEndedOrCanceled
        returns (bool success)
        {
            require(_amount <= fundsByParticipants[msg.sender]);
                fundsByParticipants[msg.sender] = fundsByParticipants[msg.sender] - _amount;
            
            require(token.transfer(msg.sender, _amount));

            emit LogWithdrawal(msg.sender, _amount);
            return true;
        }


function withdrawWinningAmount(uint256 _amount)
        public 
        onlyAfterEnd 
        onlyNotCanceled
        onlyAfterSettlement
        returns (bool success)
        {
            require(_amount <= fundsByParticipants[msg.sender]);
            fundsByParticipants[msg.sender] = fundsByParticipants[msg.sender] - _amount;
            
            require(token.transfer(msg.sender, _amount));

            emit LogWithdrawal(msg.sender, _amount);
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
        
        // transfer play entry fee to the smart contract 
        //
       
        require(token.balanceOf(msg.sender) > _value);
        require(token.transferFrom(msg.sender, address(this), _value));
        fundsByParticipants[msg.sender] = fundsByParticipants[msg.sender] + _value;

        // other data to be updated

        emit LogPlay(msg.sender);
        return true;
    }

/*         
function changeTeam(uint _value)
        public
        onlyBeforeStart
        onlyNotCanceled
        returns (bool success)
        {
        
        emit ChangeTeamDone();
        return true;
    }
*/

/*
 function updateWinningData(address[] memory _winners, uint256[] memory _amount)
        public
        onlyOwner
        onlyAfterEnd
        onlyNotCanceled
        returns (bool success)
    {
        
        // update the winning address with
        // winning amount 
        // and playid 
        // since more than one play is possible from
        // the same address 
        
        
        for (uint i=0; i<_winners.length; i++) {
            address _winner = _winners[i];

            if(participantsList[_winner]) {
                // participantsList[_playerId].points =  _points[i]; 
                fundsByWinners[_winner] = 

            }
        }
      

        emit WinnersDataUpdated();
        return true;
    }
 */

 function updatePlayerPoints(uint[] memory _playerIds, uint[] memory _points)
        public
        onlyOwner
        onlyAfterEnd
        onlyNotCanceled
        returns (bool success)
    {
        //
        // update player points  
        // 
        
        for (uint i=0; i<_playerIds.length; i++) {
            uint _playerId = _playerIds[i];

            if(playersList[_playerId]) {
                playersData[_playerId].points =  _points[i];   
            }
        }
       
        emit PlayerDataUpdated();
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



    modifier onlyAfterStart()  {
        require (block.timestamp > startTime) ;
        _;
    }

    modifier onlyBeforeStart() {
        require (block.timestamp < startTime) ;
        _;
    }

    modifier onlyNotCanceled() {
        require (!canceled);
        _;
    }


    //     modifier onlyOwner() {
    //     require(_owner == _msgSender(), "Ownable: caller is not the owner");
    //     _;
    // }

    modifier onlyBeforeEnd()  {
        require (block.timestamp < endTime) ;
        _;
    }

    modifier onlyAfterEnd()  {
        require (block.timestamp > endTime) ;
        _;
    }

    modifier onlyAfterSettlement() {
        require (settled) ;
        _;
    }

    modifier onlyEndedOrCanceled()   {
        require (block.timestamp > endTime || canceled) ;
        _;
    }

    modifier onlyOwner() {
        assert (msg.sender == owner) ;
        _;
    }

}