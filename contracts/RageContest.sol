pragma solidity 0.5.16;

import "./EIP712MetaTransaction.sol";
import "./RageToken.sol";

contract RageContest is EIP712MetaTransaction {
 
    RageToken private token;

    string public contestId;
    string public name;
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
    mapping (uint256 => uint256) public fundsByWinnersByTeam;  //id - amount
    mapping (uint256 => address) public winnersTeamIDAddress;  //id - walletaddress
  
    mapping (uint256 => bool) public participantsByTeam;  // teamid - bool

    event ContestCanceled();
    event LogPlay(address player);
    event ApprovePlay(address player);
     
    event WinnersDataUpdated();
    event PlayerDataUpdated();
    
    event LogWithdrawal(address withdrawer,  uint amount);

    event ContestCreatedEvent(address sender, string  _id, string  _name,  uint _startTime, uint _endTime, 
                string  _contestTitle);
    /*
    * Contract Constructor
    */
    constructor(address _adminOwner, string memory _id, string memory _name,  uint _startTime, uint _endTime, 
                string memory _contestTitle,
                uint256 _contestFees, 
                uint256 _winningAmount, 
                bool _isActive,
                address _token ) 
    public 
    EIP712MetaTransaction("RageContestContract","1", 80001)
    {  
        //Used constructor
        require(bytes(name).length == 0); // ensure not init'd already.
        require(bytes(_name).length > 0);

                contestId       =   _id;
                name            =   _name;
                startTime       =   _startTime;
                endTime         =   _endTime;
                contestTitle    =   _contestTitle;
                contestFees     =   _contestFees;
                winningAmount   =   _winningAmount;
                isActive        =   _isActive;
                owner = _adminOwner;            
                token = RageToken(_token); 
                canceled = false;
                settled = false;                      
    }

 function callContest() public {
    emit ContestCreatedEvent(address(this), contestId, name, startTime, endTime, contestTitle);
  }   


function withdraw(uint256 _amount, uint256 _teamId)
        public         
        returns (bool)
        {
            require(_amount <= fundsByParticipants[msgSender()]);
                fundsByParticipants[msgSender()] = fundsByParticipants[msgSender()] - _amount;
            
            require(token.transfer(msgSender(), _amount));
            participantsByTeam[_teamId] = false;

            emit LogWithdrawal(msgSender(), _amount);
            return true;
        }

function withdrawWinningAmount(uint256 _amount, uint256 _teamId)
        public         
        returns (bool)
        {
            require( _amount <= fundsByWinnersByTeam[_teamId] );
            require( msgSender() <= winnersTeamIDAddress[_teamId] );
                        
            require(token.transfer(msgSender(), _amount));
            fundsByWinnersByTeam[_teamId] = 0;

            emit LogWithdrawal(msgSender(), _amount);
            return true;

        }
     
function playNow(uint256 _value, uint256 _teamId)
        public            
        returns (bool) 
        {
        
        require (_value != 0);
        require (_value > 0);
        
        // transfer play entry fee to the smart contract 
        require(token.balanceOf(msgSender()) > _value); 
        token.transferFrom(msgSender(), address(this), _value);   

        fundsByParticipants[msgSender()] = fundsByParticipants[msgSender()] + _value;
        participantsByTeam[_teamId] = true;

        emit LogPlay(msgSender());
        return true;
    }

function updateWinnersData(address[] memory _winners, uint256[] memory _teamId, uint256[] memory _amount)
        public
        onlyOwner
        // onlyAfterEnd
        // onlyNotCanceled
        returns (bool success)
    {      
        for (uint i=0; i<_winners.length; i++) {
            address winner = _winners[i];
            uint256 teamId = _teamId[i];
            uint256 amount = _amount[i];

            if(participantsByTeam[teamId]) {
                fundsByWinnersByTeam[teamId] = amount;
                winnersTeamIDAddress[teamId] = winner;
            }
        }
        emit WinnersDataUpdated();
        return true;
    }
    
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
 
 */

    // function getContestants ()
    //     view
    //     public
    //     returns(memory address[])
    //     {
    //         return contestants;
    //     }


//
// status = true - if cancelled
// status = false - if not cancelled 
//    

function cancelContest(bool status)
        public  
        onlyOwner        
        returns (bool success)
    {
        canceled = status;

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
        assert (msgSender() == owner) ;
        _;
    }
}