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

    uint256 public prizePool;
    uint256 public decimals;

    uint256 public maxContestants;
    uint256 public minContestants;
    uint256 public startTime;
    uint256 public endTime;
    bool public canceled;
    bool public settled;
    address public player;
    address[] public contestants;

    struct Player {
        string id;
        string name;
        uint256 points;
        string captain; //C,VC,P
    }
    uint256[] public tempArray;
    mapping(uint256 => Player) public playersData;
    mapping(uint256 => bool) internal playersList;

    mapping(address => uint256) public fundsByParticipants;
    mapping(uint256 => uint256) public fundsByWinnersByTeam; //id - amount
    mapping(uint256 => address) public winnersTeamIDAddress; //id - walletaddress

    mapping(uint256 => uint256) public fundByParticipantTeam;

    mapping(uint256 => bool) public participantsByTeam; // teamid - bool

    event ContestCanceled();
    event LogPlay(address player);
    event ApprovePlay(address player);

    event WinnersDataUpdated();
    event PlayerDataUpdated();

    event LogWithdrawal(address withdrawer, uint256 amount);

    event ContestCreatedEvent(
        address sender,
        string _id,
        string _name,
        uint256 _startTime,
        uint256 _endTime,
        string _contestTitle
    );

    /*
     * Contract Constructor
     */
    constructor(
        address _adminOwner,
        string memory _id,
        string memory _name,
        uint256 _startTime,
        uint256 _endTime,
        string memory _contestTitle,
        uint256 _contestFees,
        uint256 _winningAmount,
        bool _isActive,
        address _token
    ) public EIP712MetaTransaction("RageContestContract", "1", 80001) {
        //Used constructor
        require(bytes(name).length == 0); // ensure not init'd already.
        require(bytes(_name).length > 0);

        contestId = _id;
        name = _name;
        startTime = _startTime;
        endTime = _endTime;
        contestTitle = _contestTitle;
        contestFees = _contestFees;
        winningAmount = _winningAmount;
        isActive = _isActive;
        owner = _adminOwner;
        token = RageToken(_token);
        canceled = false;
        settled = false;
    }

    function callContest() public {
        emit ContestCreatedEvent(
            address(this),
            contestId,
            name,
            startTime,
            endTime,
            contestTitle
        );
    }

    function withdraw(uint256 _amount, uint256 _teamId) public returns (bool) {
        require(_amount <= fundsByParticipants[msgSender()]);
        fundsByParticipants[msgSender()] =
            fundsByParticipants[msgSender()] -
            _amount;

        require(token.transfer(msgSender(), _amount));
        participantsByTeam[_teamId] = false;

        emit LogWithdrawal(msgSender(), _amount);
        return true;
    }

    function withdrawAdmin(uint256 _amount, address _receiver)
        public
        onlyOwner
        returns (bool)
    {
        // require(_amount <= fundsByParticipants[msgSender()]);
        // fundsByParticipants[msgSender()] =
        //     fundsByParticipants[msgSender()] -
        //     _amount;

        require(token.transfer(_receiver, _amount));

        // emit LogWithdrawal(msgSender());
        return true;
    }

    function withdrawWinningAmount(uint256 _amount, uint256 _teamId)
        public
        returns (bool)
    {
        require(_amount <= fundsByWinnersByTeam[_teamId]);
        require(msgSender() <= winnersTeamIDAddress[_teamId]);

        require(token.transfer(msgSender(), _amount));
        fundsByWinnersByTeam[_teamId] = 0;

        emit LogWithdrawal(msgSender(), _amount);
        return true;
    }

    function lengthTempArray() public view returns (uint256) {
        return tempArray.length;
    }

    function playNow(uint256 _value, uint256 _teamId) public returns (bool) {
        require(_value != 0);
        require(_value > 0);

        // transfer play entry fee to the smart contract
        require(token.balanceOf(msgSender()) > _value);
        token.transferFrom(msgSender(), address(this), _value);


        fundByParticipantTeam[_teamId] = _value;

        fundsByParticipants[msgSender()] =
            fundsByParticipants[msgSender()] +
            _value;
        participantsByTeam[_teamId] = true;

        emit LogPlay(msgSender());
        return true;
    }

    function updateWinnerData(
        address _winners,
        uint256 _teamId,
        uint256 _amount
    )
        public
        onlyOwner
        returns (
            // onlyAfterEnd
            // onlyNotCanceled
            bool
        )
    {
        fundsByWinnersByTeam[_teamId] = _amount;
        winnersTeamIDAddress[_teamId] = _winners;

        require(token.transfer(_winners, _amount));

        emit WinnersDataUpdated();
        return true;
    }

    function updateWinnersData(
        address[] memory _winners,
        uint256[] memory _teamId,
        uint256[] memory _amount
    )
        public
        onlyOwner
        returns (
            // onlyAfterEnd
            // onlyNotCanceled
            bool success
        )
    {
        for (uint256 i = 0; i < _winners.length; i++) {
            address winner = _winners[i];
            uint256 teamId = _teamId[i];
            uint256 amount = _amount[i];

            // if(participantsByTeam[teamId]) {
            fundsByWinnersByTeam[teamId] = amount;
            winnersTeamIDAddress[teamId] = winner;
            // }
        }
        emit WinnersDataUpdated();
        return true;
    }

    function getWinnerData(uint256 _teamId)
        public
        view
        returns (address, uint256)
    {
        return (winnersTeamIDAddress[_teamId], fundsByWinnersByTeam[_teamId]);
    }

    function updatePlayerPoints(
        uint256[] memory _playerIds,
        uint256[] memory _points
    ) public onlyOwner onlyAfterEnd onlyNotCanceled returns (bool success) {
        //
        // update player points
        //

        for (uint256 i = 0; i < _playerIds.length; i++) {
            uint256 _playerId = _playerIds[i];

            if (playersList[_playerId]) {
                playersData[_playerId].points = _points[i];
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

    modifier onlyAfterStart() {
        require(block.timestamp > startTime);
        _;
    }

    modifier onlyBeforeStart() {
        require(block.timestamp < startTime);
        _;
    }

    modifier onlyNotCanceled() {
        require(!canceled);
        _;
    }

    modifier onlyBeforeEnd() {
        require(block.timestamp < endTime);
        _;
    }

    modifier onlyAfterEnd() {
        require(block.timestamp > endTime);
        _;
    }

    modifier onlyAfterSettlement() {
        require(settled);
        _;
    }

    modifier onlyEndedOrCanceled() {
        require(block.timestamp > endTime || canceled);
        _;
    }

    modifier onlyOwner() {
        assert(msgSender() == owner);
        _;
    }
}
