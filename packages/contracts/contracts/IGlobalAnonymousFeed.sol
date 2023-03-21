// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IncrementalBinaryTree, IncrementalTreeData} from '@zk-kit/incremental-merkle-tree.sol/IncrementalBinaryTree.sol';
import {PolysumData} from '@unirep/contracts/libraries/Polysum.sol';

interface IGlobalAnonymousFeed {
    enum MessageType { Post, Comment }

    struct ReputationSignals {
        uint256 stateTreeRoot;
        uint256 epochKey;
        uint256 graffitiPreImage;
        uint256 proveGraffiti;
        uint256 nonce;
        uint256 epoch;
        uint256 attesterId;
        uint256 revealNonce;
        uint256 proveMinRep;
        uint256 proveMaxRep;
        uint256 proveZeroRep;
        uint256 minRep;
        uint256 maxRep;
    }

    struct MessageData {
        MessageType messageType;
        bytes32 hash;
        uint256 epochKey;
        uint256 epoch;
        uint256 personaId;
        bool isAdmin;
    }

    struct VoterData {
        uint256 epochKey;
        uint epoch;
    }

    struct VoteMeta {
        VoterData[] upvoters;
        VoterData[] downvoters;
    }

    struct Persona {
        uint256 personaId;
        string name;
        string profileImage;
        string coverImage;
        bytes32 pitch;
        bytes32 description;
    }
}