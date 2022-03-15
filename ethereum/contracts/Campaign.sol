// SPDX-License-Identifier: MIT
 
pragma solidity ^0.8.9;

contract Campaign {
    struct Request {
        string description;
        uint value;
        address payable recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) approvals;
    }

    Request[] public requests;
    address public manager;
    uint public minimumContribution;
    mapping(address => bool) public approvers;
    uint public approversCount;

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    constructor(uint minimum, address creator) {
        manager = creator;
        minimumContribution = minimum;
    }
    
    function approveRequest(uint index) public {
        Request storage request = requests[index];

        require(approvers[msg.sender]); // must be an approver
        require(!request.approvals[msg.sender]); // must not have voted already

        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }

    function contribute() public payable {
        require(msg.value > minimumContribution);

        approvers[msg.sender] = true;
        approversCount++;
    }

    function createRequest(string memory description, uint value, address payable recipient) public restricted {
        // Add argument validation with require?

        // See https://ethereum.stackexchange.com/questions/87451/solidity-error-struct-containing-a-nested-mapping-cannot-be-constructed
        Request storage newRequest = requests.push();
        newRequest.description = description;
        newRequest.value = value;   
        newRequest.recipient = recipient;
        newRequest.complete = false;
        newRequest.approvalCount = 0;
    }

    function finaliseRequest(uint index) public restricted {
        Request storage request = requests[index];

        require(!request.complete);
        require(request.approvalCount > (approversCount / 2)); // at least 50% 

        request.recipient.transfer(request.value);
        request.complete = true;
    }

    function getSummary() public view returns (
        uint, uint, uint, uint, address
    ) {
        return (
           minimumContribution,
           address(this).balance,
           requests.length,
           approversCount,
           manager 
        );
    }

    function getRequestsCount() public view returns (uint) {
        return requests.length;
    }
}

contract CampaignFactory {
    address[] public deployedCampaigns;

    function createCampaign(uint minimum) public {
        address newCampaign = address(new Campaign(minimum, msg.sender));
        deployedCampaigns.push(newCampaign);
    }

    function getDeployedCampaigns() public view returns (address[] memory) {
        return deployedCampaigns;
    }
}
