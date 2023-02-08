//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";

contract GlobalAnonymousFeed {
    error IdentityAlreadyExists();

    event GroupCreated(uint256 id);
    event GroupJoined(uint256 id, uint256 identityCommitment);

    ISemaphore public immutable semaphore;
    uint256 public constant GROUP_SIZE = 20;

    uint256 public groupId = 0;
    mapping(uint256 => mapping(uint256 => bool)) public registeredIdentities;

    constructor(address semaphoreAddress) {
        semaphore = ISemaphore(semaphoreAddress);
    }

    function createGroup() external {
        semaphore.createGroup(groupId, GROUP_SIZE, address(this));
        emit GroupCreated(groupId);

        unchecked {
            groupId++;
        }
    }

    function joinGroup(uint256 group, uint256 identityCommitment) external {
        if (registeredIdentities[group][identityCommitment] == true) {
            revert IdentityAlreadyExists();
        }

        semaphore.addMember(group, identityCommitment);
        registeredIdentities[group][identityCommitment] = true;

        emit GroupJoined(group, identityCommitment);
    }
}
