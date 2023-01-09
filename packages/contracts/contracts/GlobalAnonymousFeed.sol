//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";

contract GlobalAnonymousFeed {
    error IdentityAlreadyExists();

    event NewMessage(string message);
    event NewIdentity(uint256 identityCommitment);

    ISemaphore public semaphore;

    uint256 public groupId;
    mapping(uint256 => bool) public registeredIdentities;

    constructor(address semaphoreAddress, uint256 _groupId) {
        semaphore = ISemaphore(semaphoreAddress);
        groupId = _groupId;

        semaphore.createGroup(groupId, 20, address(this));
    }

    function joinGroup(uint256 identityCommitment) external {
        if (registeredIdentities[identityCommitment] == true) {
            revert IdentityAlreadyExists();
        }

        semaphore.addMember(groupId, identityCommitment);
        registeredIdentities[identityCommitment] = true;

        emit NewIdentity(identityCommitment);
    }

    function sendMessage(
        string calldata message,
        uint256 merkleTreeRoot,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external {
        semaphore.verifyProof(
            groupId,
            merkleTreeRoot,
            uint256(keccak256(abi.encodePacked(message))),
            nullifierHash,
            groupId,
            proof
        );

        emit NewMessage(message);
    }
}
