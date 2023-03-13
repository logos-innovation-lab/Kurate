// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IncrementalBinaryTree, IncrementalTreeData} from '@zk-kit/incremental-merkle-tree.sol/IncrementalBinaryTree.sol';
import {PolysumData} from '@unirep/contracts/libraries/Polysum.sol';

interface IGlobalAnonymousFeed {
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

    struct PostData {
        bytes32 hash;
        uint256 epochKey;
        uint epoch;
    }

    struct VoterData {
        uint256 epochKey;
        uint epoch;
    }

    struct VoteMeta {
        uint256 score;
        uint256 total;
        VoterData[] upvoters;
        VoterData[] downvoters;
    }

    struct Persona {
        uint256 personaId;
        bytes32 name;
        bytes profileImage;
        bytes coverImage;
        bytes32 pitch;
        bytes32 description;
        bytes32[5] seedPosts;
        mapping(bytes32 => bool) publishedHash;
        mapping(bytes32 => VoteMeta) votesByMessageHash;
        mapping(bytes32 => PostData) proposedPosts;
        mapping(bytes32 => PostData) proposedComments;
        bytes32[] proposedPostlist;
        bytes32[] proposedCommentlist;
    }

    struct AttesterState {
        // latest epoch key balances
        ///// Needs to be manually set to FIELD_COUNT
        mapping(uint256 => PolysumData) epkPolysum;
        mapping(uint256 => uint256[30]) data;
        mapping(uint256 => uint256[30]) dataHashes;
        // epoch key => polyhash degree
        mapping(uint256 => uint256) epochKeyIndex;
        // epoch key => latest leaf (0 if no attestation in epoch)
        mapping(uint256 => uint256) epochKeyLeaves;
        // the attester polysum
        PolysumData polysum;
    }

    struct AttesterData {
        // epoch keyed to tree data
        mapping(uint256 => IncrementalTreeData) stateTrees;
        // epoch keyed to root keyed to whether it's valid
        mapping(uint256 => mapping(uint256 => bool)) stateTreeRoots;
        // epoch keyed to root
        mapping(uint256 => uint256) epochTreeRoots;
        uint256 startTimestamp;
        uint256 currentEpoch;
        uint256 epochLength;
        mapping(uint256 => bool) identityCommitments;
        IncrementalTreeData semaphoreGroup;
        // attestation management
        mapping(uint256 => AttesterState) state;
    }
}