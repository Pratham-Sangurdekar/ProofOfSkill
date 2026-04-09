// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProofOfSkill {

    address public owner;

    // pending rewards
    mapping(address => uint256) public rewards;
    // prevent duplicate puzzle claims
    mapping(bytes32 => bool) public completedPuzzles;
    // prevent duplicate coding submissions
    mapping(bytes32 => bool) public usedSubmissions;

    uint256 public codingBaseReward = 0.01 ether;
    uint256 public puzzleReward = 0.005 ether;
    event CodingReward(address user, uint score, uint reward);
    event PuzzleReward(address user, bytes32 puzzleId);
    event Withdraw(address user, uint amount);

    constructor() {
        owner = msg.sender;
    }
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // fund contract using own MetaMask
    receive() external payable {}
    // rewards for coding challenge
    function rewardCoding(
        address user,
        uint256 score,
        bytes32 submissionHash
    ) external onlyOwner {

        require(!usedSubmissions[submissionHash], "Already used");

        usedSubmissions[submissionHash] = true;

        uint256 reward = (codingBaseReward * score) / 100;

        rewards[user] += reward;

        emit CodingReward(user, score, reward);
    }
    // reward for puzzle
    function rewardPuzzle(
        address user,
        bytes32 puzzleId
    ) external onlyOwner {

        require(!completedPuzzles[puzzleId], "Puzzle already completed");

        completedPuzzles[puzzleId] = true;

        rewards[user] += puzzleReward;

        emit PuzzleReward(user, puzzleId);
    }


    // USER WITHDRAW
    function withdraw() external {

        uint256 amount = rewards[msg.sender];

        require(amount > 0, "No rewards");

        rewards[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
         require(success, "Transfer failed");

        emit Withdraw(msg.sender, amount);
    }
    // my setting
    function setCodingReward(uint256 amount) external onlyOwner {
        codingBaseReward = amount;
    }

    function setPuzzleReward(uint256 amount) external onlyOwner {
        puzzleReward = amount;
    }

    function contractBalance() external view returns(uint){
        return address(this).balance;
    }
}