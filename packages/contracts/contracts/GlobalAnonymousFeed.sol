//SPDX-License-Identifier: MIT
pragma abicoder v2;
pragma solidity ^0.8.4;

import { Unirep } from '@unirep/contracts/Unirep.sol';

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

contract KuratePersona {
    error PostAlreadyExist();

    bytes32 public name;
    bytes public profileImage;
    bytes public coverImage;
    uint256 public pitch;
    uint256 public description;
    uint256[5] public seedPosts;

    address immutable public admin;

    Unirep public unirep;

    // Unirep social's attester ID
    uint160 immutable public attesterId;

    mapping(bytes32 => bool[]) votesByPostHash;

    mapping(bytes32 => PostData) proposedPostHashes;
    bytes32[] proposedPostHashList;

    mapping(bytes32 => PostData) proposedCommentHashes;
    bytes32[] proposedCommentHashList;

    // Positive Reputation field index in Kurate
    uint256 immutable public posRepFieldIndex = 0;

    // Nagative Reputation field index in Kurate
    uint256 immutable public negRepFieldIndex = 1;

    event NewPostHash(bytes32 postHash);

    constructor(
        address _unirepAddress,
        bytes32 _name,
        bytes memory _profileImage,
        bytes memory _coverImage,
        uint256 _pitch,
        uint256 _description,
        uint256[5] memory _seedPosts
    ) {
        unirep = Unirep(_unirepAddress);
        unirep.attesterSignUp(86400);
        attesterId = uint160(address(this));

        admin = msg.sender;

        name = _name;
        profileImage = _profileImage;
        coverImage = _coverImage;
        pitch = _pitch;
        description = _description;
        seedPosts = _seedPosts;
    }

    function userSignup(uint256[] memory publicSignals, uint256[8] memory proof) public {
        unirep.userSignUp(publicSignals, proof);
    }

    function attesterCurrentEpoch() public view returns (uint256) {
        return unirep.attesterCurrentEpoch(attesterId);
    }

    function attesterEpochRemainingTime() public view returns (uint256) {
        return unirep.attesterEpochRemainingTime(attesterId);
    }

    function proposePost(
        bytes32 postHash,
        uint256[] memory publicSignals,
        uint256[8] memory proof
    ) external {
        if (proposedPostHashes[postHash] != null) {
            revert PostAlreadyExist();
        }

        ReputationSignals memory signals = unirep.decodeReputationSignals(
            publicSignals
        );

        uint256 minRep = signals.minRep;

        require(signals.attesterId == attesterId, 'invalid attester id');
        require(minRep >= 5, "not enough reputation");

        unirep.attest(
            signals.epochKey,
            signals.epoch,
            negRepFieldIndex, // field index: posRep
            5
        );

        proposedPostHashes[postHash] = PostData(postHash, signals.epochKey, signals.epoch);
        proposedPostHashList.push(postHash);
    }

    function proposeComment(
        bytes32 postHash,
        uint256[] memory publicSignals,
        uint256[8] memory proof
    ) external {
        if (proposedPostHashes[postHash]) {
            revert PostAlreadyExist();
        }

        ReputationSignals memory signals = unirep.decodeReputationSignals(
            publicSignals
        );

        uint256 minRep = signals.minRep;

        require(signals.attesterId == attesterId, 'invalid attester id');
        require(minRep >= 2, "not enough reputation");

        unirep.attest(
            signals.epochKey,
            signals.epoch,
            negRepFieldIndex, // field index: posRep
            2
        );

        proposedCommentHashes[postHash] = PostData(postHash, signals.epochKey, signals.epoch);
        proposedCommentHashList.push(postHash);
    }

    function castVote(
        bytes32 postHash,
        bool isUpvote
    ) external {
        require(admin == msg.sender, 'only admin can cast vote');
        votesByPostHash[postHash].push(isUpvote);
    }

    function countVoteForPosts() external {
        for (uint256 i = 0; i <= proposedPostHashList.length; i++) {
            bytes32 postHash = proposedPostHashList[i];
            PostData memory postData = proposedPostHashes[postHash];
            uint256 totalVotes = votesByPostHash[postHash].length;
            uint256 result = 0;

            if (totalVotes < 3) {
                unirep.attest(
                    postData.epochKey,
                    postData.epoch,
                    posRepFieldIndex,
                    5
                );
            } else {
                for (uint256 j = 0; j <= totalVotes; j++) {
                    if (votesByPostHash[postHash][j]) {
                        result = result + 1;
                    } else {
                        result = result - 1;
                    }
                }

                if (result > 0) {
                    unirep.attest(
                        postData.epochKey,
                        postData.epoch,
                        posRepFieldIndex,
                        10
                    );

                    emit NewPostHash(postHash);
                }
            }

            delete votesByPostHash[postHash];
            delete proposedPostHashes[postHash];
        }

        proposedPostHashList = new bytes32[](0);
    }

    function countVoteForComments() external {
        for (uint256 i = 0; i <= proposedCommentHashList.length; i++) {
            bytes32 postHash = proposedCommentHashList[i];
            PostData memory postData = proposedCommentHashes[postHash];
            uint256 totalVotes = votesByPostHash[postHash].length;
            uint256 result = 0;

            if (totalVotes < 3) {
                unirep.attest(
                    postData.epochKey,
                    postData.epoch,
                    posRepFieldIndex,
                    5
                );
            } else {
                for (uint256 j = 0; j <= totalVotes; j++) {
                    if (votesByPostHash[postHash][j]) {
                        result = result + 1;
                    } else {
                        result = result - 1;
                    }
                }

                if (result > 0) {
                    unirep.attest(
                        postData.epochKey,
                        postData.epoch,
                        posRepFieldIndex,
                        10
                    );

                    emit NewPostHash(postHash);
                }
            }

            delete votesByPostHash[postHash];
            delete proposedCommentHashes[postHash];
        }

        proposedCommentHashList = new bytes32[](0);
    }
}

contract GlobalAnonymousFeed {
    error IdentityAlreadyExists();
    error GroupAlreadyExists();
    error GroupNotCreated();

    // Positive Reputation field index in Kurate
    uint256 immutable public posRepFieldIndex = 0;

    // Nagative Reputation field index in Kurate
    uint256 immutable public negRepFieldIndex = 1;

    Unirep public unirep;

    KuratePersona[] public personalist;

    event NewPersona(address personaAddress);
    event NewMember(address personaAddress, uint256 identityCommitment);

    constructor(address _unirepAddress) {
        unirep = Unirep(_unirepAddress);
    }

    function createPersona(
        bytes32 _name,
        bytes calldata _profileImage,
        bytes calldata _coverImage,
        uint256 _pitch,
        uint256 _description,
        uint256[5] calldata _seedPosts
    ) external {
        KuratePersona persona = new KuratePersona(
            address(unirep),
            _name,
            _profileImage,
            _coverImage,
            _pitch,
            _description,
            _seedPosts
        );
        personalist.push(persona);
        emit NewPersona(address(persona));
    }

    function joinPersona(
        KuratePersona personaAddress,
        uint256[] memory publicSignals,
        uint256[8] memory proof
    ) external {
        personaAddress.userSignup(publicSignals, proof);

        uint256 identityCommitment = publicSignals[0];
        emit NewMember(address(personaAddress), identityCommitment);
    }

    function proposePost(
        KuratePersona personaAddress,
        bytes32 contentHash,
        uint256[] memory publicSignals,
        uint256[8] memory proof
    ) external payable {
        personaAddress.proposePost(contentHash, publicSignals, proof);
    }

    function proposeComment(
        KuratePersona personaAddress,
        bytes32 contentHash,
        uint256[] memory publicSignals,
        uint256[8] memory proof
    ) external payable {
        personaAddress.proposeComment(contentHash, publicSignals, proof);
    }
}
