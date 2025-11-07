// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract IssueRegistry is AccessControl {
    bytes32 public constant AUTHORITY_ROLE = keccak256("AUTHORITY_ROLE");
    
    enum IssueStatus { Pending, Verified, Assigned, InProgress, Resolved, Rejected }
    
    struct Issue {
        string issueId;
        address reporter;
        string category;
        IssueStatus status;
        uint256 upvotes;
        uint256 reportedAt;
        uint256 resolvedAt;
        address assignedTo;
        string ipfsHash;
        bool exists;
    }
    
    mapping(string => Issue) public issues;
    mapping(address => uint256) public userIssueCount;
    
    string[] public issueIds;
    
    event IssueRegistered(
        string indexed issueId,
        address indexed reporter,
        string category,
        uint256 timestamp
    );
    
    event IssueStatusUpdated(
        string indexed issueId,
        IssueStatus newStatus,
        uint256 timestamp
    );
    
    event IssueUpvoted(
        string indexed issueId,
        address indexed voter,
        uint256 newUpvoteCount
    );
    
    event IssueAssigned(
        string indexed issueId,
        address indexed authority,
        uint256 timestamp
    );
    
    event IssueResolved(
        string indexed issueId,
        address indexed resolver,
        uint256 timestamp
    );
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(AUTHORITY_ROLE, msg.sender);
    }
    
    function registerIssue(
        string memory _issueId,
        string memory _category,
        string memory _ipfsHash
    ) external {
        require(!issues[_issueId].exists, "Issue already registered");
        
        issues[_issueId] = Issue({
            issueId: _issueId,
            reporter: msg.sender,
            category: _category,
            status: IssueStatus.Pending,
            upvotes: 0,
            reportedAt: block.timestamp,
            resolvedAt: 0,
            assignedTo: address(0),
            ipfsHash: _ipfsHash,
            exists: true
        });
        
        issueIds.push(_issueId);
        userIssueCount[msg.sender]++;
        
        emit IssueRegistered(_issueId, msg.sender, _category, block.timestamp);
    }
    
    function upvoteIssue(string memory _issueId) external {
        require(issues[_issueId].exists, "Issue does not exist");
        
        issues[_issueId].upvotes++;
        
        emit IssueUpvoted(_issueId, msg.sender, issues[_issueId].upvotes);
    }
    
    function assignIssue(
        string memory _issueId,
        address _authority
    ) external onlyRole(AUTHORITY_ROLE) {
        require(issues[_issueId].exists, "Issue does not exist");
        require(
            issues[_issueId].status == IssueStatus.Pending ||
            issues[_issueId].status == IssueStatus.Verified,
            "Issue cannot be assigned"
        );
        
        issues[_issueId].assignedTo = _authority;
        issues[_issueId].status = IssueStatus.Assigned;
        
        emit IssueAssigned(_issueId, _authority, block.timestamp);
        emit IssueStatusUpdated(_issueId, IssueStatus.Assigned, block.timestamp);
    }
    
    function updateIssueStatus(
        string memory _issueId,
        IssueStatus _newStatus
    ) external onlyRole(AUTHORITY_ROLE) {
        require(issues[_issueId].exists, "Issue does not exist");
        
        issues[_issueId].status = _newStatus;
        
        if (_newStatus == IssueStatus.Resolved) {
            issues[_issueId].resolvedAt = block.timestamp;
            emit IssueResolved(_issueId, msg.sender, block.timestamp);
        }
        
        emit IssueStatusUpdated(_issueId, _newStatus, block.timestamp);
    }
    
    function getIssue(string memory _issueId) 
        external 
        view 
        returns (
            address reporter,
            string memory category,
            IssueStatus status,
            uint256 upvotes,
            uint256 reportedAt,
            uint256 resolvedAt,
            address assignedTo,
            string memory ipfsHash
        ) 
    {
        require(issues[_issueId].exists, "Issue does not exist");
        
        Issue memory issue = issues[_issueId];
        return (
            issue.reporter,
            issue.category,
            issue.status,
            issue.upvotes,
            issue.reportedAt,
            issue.resolvedAt,
            issue.assignedTo,
            issue.ipfsHash
        );
    }
    
    function getTotalIssues() external view returns (uint256) {
        return issueIds.length;
    }
    
    function getUserIssueCount(address _user) external view returns (uint256) {
        return userIssueCount[_user];
    }
    
    function grantAuthorityRole(address _authority) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(AUTHORITY_ROLE, _authority);
    }
    
    function revokeAuthorityRole(address _authority) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(AUTHORITY_ROLE, _authority);
    }
}
