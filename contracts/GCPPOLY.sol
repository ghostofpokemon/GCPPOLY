// SPDX-License-Identifier: MIT

pragma solidity ^0.6.6;

import "@chainlink/contracts/src/v0.6/ChainlinkClient.sol";

contract GCPPOLY is ChainlinkClient {
    constructor() public payable {
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
        oracle = 0xc8D925525CA8759812d0c299B90247917d4d4b7C;
        jobId = "bbf0badad29d49dc887504bacfbb905b";
        fee = 0.01 * 10**18;
        durationInMinutes = 2;
        contractBalance += msg.value;
        owner = msg.sender;
    }

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;
    uint256 public durationInMinutes;
    uint256 private contractBalance;
    uint256 public GCPnum;
    address public owner;
    uint256 private linkBalance;
    uint256 public result;

    struct Temp {
        bytes32 id;
        uint256 result;
        address playerAddress;
    }

    struct PlayerByAddress {
        uint256 balance;
        uint256 betAmount;
        uint256 betChoice;
        address playerAddress;
        bool betOngoing;
    }

    mapping(address => PlayerByAddress) public playersByAddress;
    mapping(bytes32 => Temp) public temps;

    event DepositToContract(
        address user,
        uint256 depositAmount,
        uint256 newBalance
    );
    event Withdrawal(address player, uint256 amount);
    event NewIdRequest(address indexed player, bytes32 requestId);
    event ProducedGCPindex(bytes32 requestId, uint256 amount);
    event BetResult(address indexed player, bool victory, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Ownable: caller is not the owner");
        _;
    }

    modifier betConditions {
        require(msg.value >= 0.000001 ether, "Need to increase that bet!");
        require(
            msg.value <= getContractBalance() / 11,
            "Too rich for my blood."
        );
        require(
            playersByAddress[msg.sender].betOngoing == false,
            "A bet is already ongoing with this address."
        );
        _;
    }

    function bet(uint256 _betChoice) public payable betConditions {
        require(
            _betChoice == 0 || _betChoice == 1,
            "The choice must be either 0 or 1"
        );

        playersByAddress[msg.sender].playerAddress = msg.sender;
        playersByAddress[msg.sender].betChoice = _betChoice;
        playersByAddress[msg.sender].betOngoing = true;
        playersByAddress[msg.sender].betAmount = msg.value;
        contractBalance += playersByAddress[msg.sender].betAmount;

        bytes32 newRequestId = requestGCP();
        temps[newRequestId].playerAddress = msg.sender;
        temps[newRequestId].id = newRequestId;

        emit NewIdRequest(msg.sender, newRequestId);
    }

    function requestGCP() public returns (bytes32 requestId) {
        Chainlink.Request memory request =
            buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        request.addUint("sleep", now + durationInMinutes * 1 minutes);
        request.add("get", "http://silkandsilt.com");
        int256 timesAmount = 10**7;
        request.addInt("times", timesAmount);
        return sendChainlinkRequestTo(oracle, request, fee);
    }

    function fulfill(bytes32 requestId, uint256 GCP)
        public
        recordChainlinkFulfillment(requestId)
    {
        GCPnum = GCP;
        temps[requestId].result = GCPnum;

        checkResult(GCPnum, requestId);

        emit ProducedGCPindex(requestId, GCPnum);
    }

    function checkResult(uint256 _GCPnum, bytes32 _requestId)
        public
        returns (bool)
    {
        address player = temps[_requestId].playerAddress;
        bool win = false;
        uint256 amountWon;

        if ((10000000 > _GCPnum) && (_GCPnum > 5100000)) {
            result = 0;
        } else if ((0 < _GCPnum) && (_GCPnum < 4900000)) {
            result = 1;
        } else {
            result = 2;
        }

        if (playersByAddress[player].betChoice == result) {
            win = true;
            amountWon = playersByAddress[player].betAmount * 2;
            playersByAddress[player].balance =
                playersByAddress[player].balance +
                amountWon;
            contractBalance = contractBalance - amountWon;
        }

        emit BetResult(player, win, amountWon);

        playersByAddress[player].betAmount = 0;
        playersByAddress[player].betOngoing = false;

        delete (temps[_requestId]);
        return win;
    }

    function deposit() public payable {
        require(msg.value > 0);

        contractBalance += msg.value;

        emit DepositToContract(msg.sender, msg.value, contractBalance);
    }

    function getPlayerBalance() public view returns (uint256) {
        return playersByAddress[msg.sender].balance;
    }

    function getContractBalance() public view returns (uint256) {
        return contractBalance;
    }

    function getLinkBalance() public view returns (uint256) {
        LinkTokenInterface linkToken =
            LinkTokenInterface(chainlinkTokenAddress());
        return linkToken.balanceOf(address(this));
    }

    function withdrawPlayerBalance() public {
        require(msg.sender != address(0), "This address doesn't exist.");
        require(
            playersByAddress[msg.sender].balance > 0,
            "You don't have any fund to withdraw."
        );
        require(
            playersByAddress[msg.sender].betOngoing == false,
            "this address still has an open bet."
        );

        uint256 amount = playersByAddress[msg.sender].balance;
        msg.sender.transfer(amount);
        delete (playersByAddress[msg.sender]);

        emit Withdrawal(msg.sender, amount);
    }

    function withdrawContractBalance() public onlyOwner {
        payout(msg.sender);
    }

    function withdrawLink() public onlyOwner {
        LinkTokenInterface linkToken =
            LinkTokenInterface(chainlinkTokenAddress());
        require(
            linkToken.transfer(msg.sender, linkToken.balanceOf(address(this))),
            "Unable to transfer"
        );
    }

    function payout(address payable to) internal returns (uint256) {
        require(contractBalance != 0, "No funds to withdraw");

        uint256 toTransfer = address(this).balance;
        contractBalance -= toTransfer;
        to.transfer(toTransfer);
        return toTransfer;
    }

    function approveNextOwner(address _nextOwner) external onlyOwner {
        require(_nextOwner != owner, "Cannot approve current owner.");
        owner = _nextOwner;
    }
}
