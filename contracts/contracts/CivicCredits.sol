// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CivicCredits is ERC20, Ownable {
    // Mapping to track user activities
    mapping(address => uint256) public issuesReported;
    mapping(address => uint256) public upvotesReceived;
    mapping(address => uint256) public issuesResolved;
    
    // Credit rewards
    uint256 public constant REPORT_REWARD = 10 * 10**18;
    uint256 public constant UPVOTE_REWARD = 2 * 10**18;
    uint256 public constant RESOLUTION_REWARD = 50 * 10**18;
    uint256 public constant VERIFICATION_REWARD = 5 * 10**18;
    
    event CreditsAwarded(
        address indexed user,
        uint256 amount,
        string reason
    );
    
    event CreditsRedeemed(
        address indexed user,
        uint256 amount,
        string purpose
    );
    
    constructor() ERC20("CivicCredits", "CVC") Ownable(msg.sender) {
        // Mint initial supply to contract owner
        _mint(msg.sender, 1000000 * 10**18);
    }
    
    function awardReportCredits(address _user) external onlyOwner {
        _mint(_user, REPORT_REWARD);
        issuesReported[_user]++;
        
        emit CreditsAwarded(_user, REPORT_REWARD, "Issue Reported");
    }
    
    function awardUpvoteCredits(address _user) external onlyOwner {
        _mint(_user, UPVOTE_REWARD);
        upvotesReceived[_user]++;
        
        emit CreditsAwarded(_user, UPVOTE_REWARD, "Upvote Received");
    }
    
    function awardResolutionCredits(address _user) external onlyOwner {
        _mint(_user, RESOLUTION_REWARD);
        issuesResolved[_user]++;
        
        emit CreditsAwarded(_user, RESOLUTION_REWARD, "Issue Resolved");
    }
    
    function awardVerificationCredits(address _user) external onlyOwner {
        _mint(_user, VERIFICATION_REWARD);
        
        emit CreditsAwarded(_user, VERIFICATION_REWARD, "Issue Verified");
    }
    
    function awardCustomCredits(
        address _user,
        uint256 _amount,
        string memory _reason
    ) external onlyOwner {
        _mint(_user, _amount);
        
        emit CreditsAwarded(_user, _amount, _reason);
    }
    
    function redeemCredits(uint256 _amount, string memory _purpose) external {
        require(balanceOf(msg.sender) >= _amount, "Insufficient credits");
        
        _burn(msg.sender, _amount);
        
        emit CreditsRedeemed(msg.sender, _amount, _purpose);
    }
    
    function getUserStats(address _user)
        external
        view
        returns (
            uint256 balance,
            uint256 reported,
            uint256 upvotes,
            uint256 resolved
        )
    {
        return (
            balanceOf(_user),
            issuesReported[_user],
            upvotesReceived[_user],
            issuesResolved[_user]
        );
    }
    
    function mint(address _to, uint256 _amount) external onlyOwner {
        _mint(_to, _amount);
    }
}
