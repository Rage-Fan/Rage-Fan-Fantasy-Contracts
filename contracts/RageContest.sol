pragma solidity 0.5.16;

import "./EIP712MetaTransaction.sol";
import {RageToken} from "./RageToken.sol";

contract RageContest is EIP712MetaTransaction {
    RageToken private token;

    string public contestId;
    string public name;
    string public contestTitle;
    uint256 public contestFee;

    address public owner;
    address public creator;

    uint256 public minimumPlayers;
    uint256 public maximumPlayers;

    uint256 public startTime;
    uint256 public endTime;
    address[] public contestants;

    uint256[] public teamList;

    struct PlayerPoint {
        uint256[] playerId;
        uint256[] point;
    }
    mapping(uint256 => PlayerPoint) particpant;

    struct TeamData {
        uint256[] playerId;
        address particpant;
        uint256 teamId;
    }

    mapping(uint256 => TeamData) playerData;

    uint256[] public playersId;
    uint256[] public points;


    mapping(address => uint256) public fundsByParticipants;
    mapping(uint256 => uint256) public fundsByWinnersByTeam; //id - amount
    mapping(uint256 => address) public winnersTeamIDAddress; //id - walletaddress

    mapping(uint256 => bool) public participantsByTeam; // teamid - bool

    event LogPlay(address player);

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
        address _creator,
        string memory _id,
        string memory _name,
        uint256 _startTime,
        uint256 _endTime,
        string memory _contestTitle,
        uint256 _contestFee,
        uint256 _minimumPlayer,
        uint256 _maximumPlayer,
        address _token
    ) public EIP712MetaTransaction("RageContestContract", "1", 137) {
        //Used constructor
        require(bytes(name).length == 0); // ensure not init'd already.
        require(bytes(_name).length > 0);

        contestId = _id;
        name = _name;
        startTime = _startTime;
        endTime = _endTime;
        contestTitle = _contestTitle;
        contestFee = _contestFee;
        creator = _creator;
        owner = _adminOwner;
        minimumPlayers = _minimumPlayer;
        maximumPlayers = _maximumPlayer;
        token = RageToken(_token);
        emit ContestCreatedEvent(
            address(this),
            contestId,
            name,
            startTime,
            endTime,
            contestTitle
        );
    }

    function withdrawAdmin(uint256 value, address _receiver) public onlyOwner {
        require(token.transfer(_receiver, value));
    }


    function playNow(uint256 _value, uint256 _teamId) public returns (bool) {
        require(_value == contestFee);
        require(!participantsByTeam[_teamId]);
        require(maximumPlayers < teamList.length);
        // transfer play entry fee to the smart contract
        require(token.balanceOf(msgSender()) > contestFee);
        token.transferFrom(msgSender(), address(this), contestFee);
        
        teamList.push(_teamId);

        fundsByParticipants[msgSender()] =
            fundsByParticipants[msgSender()] +
            contestFee;
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
        onlyAfterEnd
        returns (
            bool
        )
    {
        require(minimumPlayers >= teamList.length, "Not Enough Team Registerd");
        require(_winner.length == _teamId.length, "Length Doesn't Match.");
        require(_teamId.length == _amount.length, "Length Doesn't Match.");
        for (uint256 i = 0; i < _winner.length; i++) {
            if (participantsByTeam[_teamId[i]]) {
            fundsByWinnersByTeam[_teamId[i]] = _amount[i] * 1e18;
            winnersTeamIDAddress[_teamId[i]] = _winner[i];
            require(token.transfer(_winner[i], _amount[i] * 1e18));
            }
        }

        return true;
    }

    function cancelMatch(
        address[] memory _player,
        uint256[] memory _teamId
    )
        public
        onlyOwner
        onlyAfterEnd
        returns (
            bool
        )
    {
        require(_player.length == _teamId.length, "Length Doesn't Match.");
        for (uint256 i = 0; i < _player.length; i++) {
            if (participantsByTeam[_teamId[i]]) {
            require(token.transfer(_player[i], contestFee));
            }
        }

        return true;
    }

    function getWinnerData(uint256 _teamId)
        public
        view
        returns (address, uint256)
    {
        return (winnersTeamIDAddress[_teamId], fundsByWinnersByTeam[_teamId]);
    }

    

    function setPlayerPoint(
        uint256[] memory _player,
        uint256[] memory _point,
        uint256 _matchId
    ) public onlyOwner returns (bool) {
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

    function setTeamData(
        uint256[] memory _player,
        address _particpant,
        uint256 _teamId,
        uint256 _trx
    ) public onlyOwner returns (bool) {
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



    modifier onlyAfterEnd() {
        require(block.timestamp >= endTime);
        _;
    }

    modifier onlyOwner() {
        assert(msgSender() == owner);
        _;
    }
}
