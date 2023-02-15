//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";

contract GlobalAnonymousFeed {
    error IdentityAlreadyExists();

    event GroupCreated(uint256 id);
    event GroupJoined(uint256 id, uint256 identityCommitment);

    ISemaphore public immutable semaphore;
    uint256 public constant GROUP_SIZE = 20;

    mapping(uint256 => bool) public registeredIdentities;

    constructor(address semaphoreAddress) {
        semaphore = ISemaphore(semaphoreAddress);
    }

    function createGroup() external returns (uint256 id) {
        // The msg.sender is there to prevent longer loops if
        // multiple groups are created in the same block.
        id = uint256(keccak256(abi.encodePacked(msg.sender, block.difficulty)));
        while (true) {
            try semaphore.createGroup(id, GROUP_SIZE, address(this)) {
                break;
            } catch {
                id = uint256(keccak256(abi.encodePacked(id)));
            }
        }
        emit GroupCreated(id);
    }

    function createGroup(uint256 id) external {
        semaphore.createGroup(id, GROUP_SIZE, address(this));
        emit GroupCreated(id);
    }

    function joinGroup(uint256 group, uint256 identityCommitment) external {
        if (registeredIdentities[identityCommitment] == true) {
            revert IdentityAlreadyExists();
        }

        semaphore.addMember(group, identityCommitment);
        registeredIdentities[identityCommitment] = true;

        emit GroupJoined(group, identityCommitment);
    }
}
