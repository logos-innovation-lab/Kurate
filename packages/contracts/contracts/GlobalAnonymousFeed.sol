//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";

contract GlobalAnonymousFeed {
    error IdentityAlreadyExists();
    error GroupAlreadyExists();
    error GroupNotCreated();

    ISemaphore public semaphore;

    mapping(uint256 => bool) public groups;
    mapping(uint256 => mapping(uint256 => bool)) public groupMembers;

    event NewGroup(uint256 groupId);
    event NewIdentity(uint256 groupId, uint256 identityCommitment);

    constructor(address semaphoreAddress) {
        semaphore = ISemaphore(semaphoreAddress);
    }

    function createGroup(uint256 groupId) external {
        semaphore.createGroup(groupId, 20, address(this));
        groups[groupId] = true;
        emit NewGroup(groupId);
    }

    function joinGroup(uint256 groupId, uint256 identityCommitment) external {
        if (groups[groupId] != true) {
            revert GroupNotCreated();
        }

        if (groupMembers[groupId][identityCommitment] == true) {
            revert IdentityAlreadyExists();
        }

        semaphore.addMember(groupId, identityCommitment);
        groupMembers[groupId][identityCommitment] = true;
        emit NewIdentity(groupId, identityCommitment);
    }

    function createAndJoin(uint256 groupId, uint256 identityCommitment) external {
        this.createGroup(groupId);
        this.joinGroup(groupId, identityCommitment);
    }
}
