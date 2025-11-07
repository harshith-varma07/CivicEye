// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SLAContract is Ownable {
    struct SLA {
        string issueId;
        address authority;
        uint256 deadline;
        uint256 penalty;
        bool isCompleted;
        bool isPenalized;
        uint256 completedAt;
    }
    
    mapping(string => SLA) public slas;
    mapping(address => uint256) public authorityPenalties;
    
    string[] public slaIssueIds;
    
    event SLACreated(
        string indexed issueId,
        address indexed authority,
        uint256 deadline,
        uint256 penalty
    );
    
    event SLACompleted(
        string indexed issueId,
        address indexed authority,
        uint256 completedAt,
        bool onTime
    );
    
    event PenaltyApplied(
        string indexed issueId,
        address indexed authority,
        uint256 penalty
    );
    
    constructor() Ownable(msg.sender) {}
    
    function createSLA(
        string memory _issueId,
        address _authority,
        uint256 _daysToResolve,
        uint256 _penalty
    ) external onlyOwner {
        require(bytes(slas[_issueId].issueId).length == 0, "SLA already exists");
        
        uint256 deadline = block.timestamp + (_daysToResolve * 1 days);
        
        slas[_issueId] = SLA({
            issueId: _issueId,
            authority: _authority,
            deadline: deadline,
            penalty: _penalty,
            isCompleted: false,
            isPenalized: false,
            completedAt: 0
        });
        
        slaIssueIds.push(_issueId);
        
        emit SLACreated(_issueId, _authority, deadline, _penalty);
    }
    
    function completeSLA(string memory _issueId) external {
        require(bytes(slas[_issueId].issueId).length > 0, "SLA does not exist");
        require(!slas[_issueId].isCompleted, "SLA already completed");
        require(
            msg.sender == owner() || msg.sender == slas[_issueId].authority,
            "Not authorized"
        );
        
        slas[_issueId].isCompleted = true;
        slas[_issueId].completedAt = block.timestamp;
        
        bool onTime = block.timestamp <= slas[_issueId].deadline;
        
        if (!onTime) {
            slas[_issueId].isPenalized = true;
            authorityPenalties[slas[_issueId].authority] += slas[_issueId].penalty;
            
            emit PenaltyApplied(
                _issueId,
                slas[_issueId].authority,
                slas[_issueId].penalty
            );
        }
        
        emit SLACompleted(_issueId, slas[_issueId].authority, block.timestamp, onTime);
    }
    
    function getSLA(string memory _issueId)
        external
        view
        returns (
            address authority,
            uint256 deadline,
            uint256 penalty,
            bool isCompleted,
            bool isPenalized,
            uint256 completedAt
        )
    {
        require(bytes(slas[_issueId].issueId).length > 0, "SLA does not exist");
        
        SLA memory sla = slas[_issueId];
        return (
            sla.authority,
            sla.deadline,
            sla.penalty,
            sla.isCompleted,
            sla.isPenalized,
            sla.completedAt
        );
    }
    
    function getAuthorityPenalties(address _authority) external view returns (uint256) {
        return authorityPenalties[_authority];
    }
    
    function getTotalSLAs() external view returns (uint256) {
        return slaIssueIds.length;
    }
    
    function isSLAOverdue(string memory _issueId) external view returns (bool) {
        require(bytes(slas[_issueId].issueId).length > 0, "SLA does not exist");
        
        if (slas[_issueId].isCompleted) {
            return false;
        }
        
        return block.timestamp > slas[_issueId].deadline;
    }
}
