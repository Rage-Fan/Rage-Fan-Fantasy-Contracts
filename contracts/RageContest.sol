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

    uint256 public maxContestants;
    uint256 public minContestants;
    uint256 public startTime;
    uint256 public endTime;
    bool public canceled;
    bool public settled;
    address public player;
    address[] public contestants;

    // struct Player {
    //     string id;
    //     string name;
    //     uint256 points;
    //     string captain; //C,VC,P
    // }

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

    function withdrawAdmin(uint256 value,address _receiver) public onlyOwner returns (bool) {
        require(token.transfer(_receiver, value));

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
        address[] memory _winner,
        uint256[] memory _teamId,
        uint256[] memory _amount
    )
        public
        onlyOwner
        returns (
            // onlyAfterEnd
            // onlyNotCanceled
            bool
        )
    {
        require(_winner.length == _teamId.length, "Length Doesn't Match.");
        require(_teamId.length == _amount.length, "Length Doesn't Match.");
        for (uint256 i = 0; i < _winner.length; i++) {
            // if (participantsByTeam[_teamId[i]]) {
                fundsByWinnersByTeam[_teamId[i]] = _amount[i] * 1e18;
                winnersTeamIDAddress[_teamId[i]] = _winner[i];
                require(token.transfer(_winner[i], _amount[i] * 1e18));
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

    struct PlayerPoint {
        uint256[] playerId;
        uint256[] point;
    }
    mapping(uint256 => PlayerPoint) particpant;

    uint256[] public playersId;
    uint256[] public points;

    function setPlayerPoint(
        uint256[] memory _player,
        uint256[] memory _point,
        uint256 _matchId
    ) public onlyOwner returns (bool) {
        require(msg.sender == owner);
        for (uint256 i = 0; i < _player.length; i++) {
            playersId.push(_player[i]);
            points.push(_point[i]);
        }

        particpant[_matchId].playerId = playersId;
        particpant[_matchId].point = points;
        return true;
    }

    function getPlayerPoint(uint256 _matchId)
        public
        view
        returns (uint256[] memory, uint256[] memory)
    {
        return (particpant[_matchId].playerId, particpant[_matchId].point);
    }

    struct TeamData {
        uint256[] playerId;
        address particpant;
        uint256 teamId;
    }

    mapping(uint256 => TeamData) playerData;

    function setTeamData(
        uint256[] memory _player,
        address _particpant,
        uint256 _teamId,
        uint256 _trx
    ) public onlyOwner returns (bool) {
        require(msg.sender == owner);
        for (uint256 i = 0; i < _player.length; i++) {
            playersId.push(_player[i]);
        }

        playerData[_trx].playerId = playersId;
        playerData[_trx].particpant = _particpant;
        playerData[_trx].teamId = _teamId;
        return true;
    }

    function getTeamData(uint256 _trx)
        public
        view
        returns (
            uint256[] memory,
            address,
            uint256
        )
    {
        return (
            playerData[_trx].playerId,
            playerData[_trx].particpant,
            playerData[_trx].teamId
        );
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

    function cancelContest(bool status) public onlyOwner returns (bool) {
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
