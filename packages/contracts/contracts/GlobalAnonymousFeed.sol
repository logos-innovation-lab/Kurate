//SPDX-License-Identifier: MIT
pragma abicoder v2;
pragma solidity ^0.8.4;

import { Unirep, IUnirep } from '@unirep/contracts/Unirep.sol';
import { IGlobalAnonymousFeed } from './IGlobalAnonymousFeed.sol';

contract GlobalAnonymousFeed is IGlobalAnonymousFeed {
    error IdentityNotExist();

    error MemberAlreadyJoined();

    error GroupAlreadyExists();

    error GroupNotCreated();

    error MessageAlreadyExist();

    error MessageNotExist();

    address admin;

    uint160 public attesterId;

    // Positive Reputation field index in Kurate
    uint256 immutable public posRepFieldIndex = 0;

    // Nagative Reputation field index in Kurate
    uint256 immutable public negRepFieldIndex = 1;

    uint256 immutable public createPersonaRep = 10;
    uint256 immutable public postRep = 5;
    uint256 immutable public commentRep = 3;
    uint256 immutable public postReward = 5;
    uint256 immutable public commentReward = 3;
    uint256 immutable public voterReward = 1;

    Unirep public unirep;

    mapping(uint256 => Persona) public personas;
    uint256[] public personaList;

    mapping(uint256 => mapping(uint256 => bool)) public membersByPersona;
    mapping(uint256 => bool) public members;

    event NewPersona(uint256 personaId);
    event NewPersonaMember(uint256 personaId, uint256 identityCommitment);
    event NewPersonaPost(uint256 personaId, bytes32 postHash);
    event NewPersonaComment(uint256 personaId, bytes32 postHash, bytes32 commentHash);

    /// Restricted to members of the admin role.
    modifier onlyAdmin() {
        require(msg.sender == admin, "Restricted to admin.");
        _;
    }

    constructor(
        address _unirepAddress
    ) {
        unirep = Unirep(_unirepAddress);
        unirep.attesterSignUp(86400);
        attesterId = uint160(address(this));
        admin = msg.sender;
    }

    function attesterCurrentEpoch() public view returns (uint256) {
        return unirep.attesterCurrentEpoch(attesterId);
    }

    function attesterEpochRemainingTime() public view returns (uint256) {
        return unirep.attesterEpochRemainingTime(attesterId);
    }

    function createPersona(
        uint256 personaId,
        string memory name,
        string memory profileImage,
        string memory coverImage,
        bytes32 pitch,
        bytes32 description,
        bytes32[5] memory seedPosts,
        uint256[] memory publicSignals,
        uint256[8] memory proof
    ) onlyAdmin external {
        if (personas[personaId].personaId > 0) {
            revert GroupAlreadyExists();
        }

        IUnirep.ReputationSignals memory signals = unirep.decodeReputationSignals(
            publicSignals
        );

        finalizeEpochIfNeeded(signals.epoch);

        uint256 minRep = signals.minRep;
        require(minRep >= createPersonaRep, "not enough reputation");

        unirep.verifyReputationProof(publicSignals, proof);

        unirep.attest(
            signals.epochKey,
            signals.epoch,
            negRepFieldIndex,
            createPersonaRep
        );

        Persona storage persona = personas[personaId];

        persona.personaId = personaId;
        persona.name = name;
        persona.profileImage = profileImage;
        persona.coverImage = coverImage;
        persona.pitch = pitch;
        persona.description = description;

        personaList.push(personaId);

        emit NewPersona(personaId);

        for (uint256 i = 0; i < seedPosts.length; i++) {
            emit NewPersonaPost(personaId, seedPosts[i]);
        }
    }

    function createPersona(
        uint256 personaId,
        string memory name,
        string memory profileImage,
        string memory coverImage,
        bytes32 pitch,
        bytes32 description,
        bytes32[5] memory seedPosts
    ) onlyAdmin external {
        if (personas[personaId].personaId > 0) {
            revert GroupAlreadyExists();
        }

        Persona storage persona = personas[personaId];

        persona.personaId = personaId;
        persona.name = name;
        persona.profileImage = profileImage;
        persona.coverImage = coverImage;
        persona.pitch = pitch;
        persona.description = description;

        personaList.push(personaId);

        emit NewPersona(personaId);

        for (uint256 i = 0; i < seedPosts.length; i++) {
            emit NewPersonaPost(personaId, seedPosts[i]);
        }
//        emit NewPersonaPost(personaId, seedPosts[0]);
//        emit NewPersonaPost(personaId, seedPosts[1]);
//        emit NewPersonaPost(personaId, seedPosts[2]);
//        emit NewPersonaPost(personaId, seedPosts[3]);
//        emit NewPersonaPost(personaId, seedPosts[4]);
    }

    // @dev Required ZK Proof for first time joining a group.
    function joinPersona(
        uint256 personaId,
        uint256[] memory publicSignals,
        uint256[8] memory proof
    ) external {
        uint256 identityCommitment = publicSignals[0];

        if (membersByPersona[personaId][identityCommitment] || members[identityCommitment]) {
            revert MemberAlreadyJoined();
        }

        unirep.userSignUp(publicSignals, proof);

        members[identityCommitment] = true;
        membersByPersona[personaId][identityCommitment] = true;

        emit NewPersonaMember(personaId, identityCommitment);
    }

    // @dev use this method if the user already joined a persona before
    function joinPersona(
        uint256 personaId,
        uint256 identityCommitment
    ) external {
        require(members[identityCommitment], 'member must join unirep first');

        if (membersByPersona[personaId][identityCommitment]) {
            revert MemberAlreadyJoined();
        }

        membersByPersona[personaId][identityCommitment] = true;

        emit NewPersonaMember(personaId, identityCommitment);
    }

    function proposePost(
        uint256 personaId,
        bytes32 messageHash,
        uint256[] memory publicSignals,
        uint256[8] memory proof
    ) onlyAdmin external payable {
        Persona storage persona = personas[personaId];

        if (persona.proposedPosts[messageHash].hash != bytes32(0)) {
            revert MessageAlreadyExist();
        }

        if (persona.publishedHash[messageHash]) {
            revert MessageAlreadyExist();
        }

        IUnirep.ReputationSignals memory signals = unirep.decodeReputationSignals(
            publicSignals
        );

        finalizeEpochIfNeeded(signals.epoch);

        uint256 minRep = signals.minRep;
        require(signals.attesterId == attesterId, 'invalid attester id');
        require(minRep >= postRep, "not enough reputation");

        unirep.verifyReputationProof(publicSignals, proof);

        unirep.attest(
            signals.epochKey,
            signals.epoch,
            negRepFieldIndex,
            postRep
        );

        persona.proposedPosts[messageHash] = PostData(messageHash, signals.epochKey, signals.epoch);
        persona.proposedPostlist.push(messageHash);
    }

    function proposeComment(
        uint256 personaId,
        bytes32 messageHash,
        uint256[] memory publicSignals,
        uint256[8] memory proof
    ) onlyAdmin external payable {
        Persona storage persona = personas[personaId];

        if (persona.proposedComments[messageHash].hash != bytes32(0)) {
            revert MessageAlreadyExist();
        }

        if (persona.publishedHash[messageHash]) {
            revert MessageAlreadyExist();
        }


        IUnirep.ReputationSignals memory signals = unirep.decodeReputationSignals(
            publicSignals
        );
        finalizeEpochIfNeeded(signals.epoch);

        uint256 minRep = signals.minRep;
        require(signals.attesterId == attesterId, 'invalid attester id');
        require(minRep >= commentRep, "not enough reputation");

        unirep.verifyReputationProof(publicSignals, proof);

        unirep.attest(
            signals.epochKey,
            signals.epoch,
            negRepFieldIndex,
            commentRep
        );

        persona.proposedComments[messageHash] = PostData(messageHash, signals.epochKey, signals.epoch);
        persona.proposedCommentlist.push(messageHash);
    }

    function vote(
        uint256 personaId,
        bytes32 messageHash,
        bool isUpvote,
        uint256[] memory publicSignals,
        uint256[8] memory proof
    ) onlyAdmin external  {
        Persona storage persona = personas[personaId];

        if (persona.proposedPosts[messageHash].hash == bytes32(0)) {
            revert MessageNotExist();
        }

        IUnirep.ReputationSignals memory signals = unirep.decodeReputationSignals(
            publicSignals
        );

        finalizeEpochIfNeeded(signals.epoch);

        unirep.verifyReputationProof(publicSignals, proof);

        VoteMeta storage voteMeta = persona.votesByMessageHash[messageHash];
        voteMeta.total = voteMeta.total + 1;
        voteMeta.score = isUpvote ? voteMeta.score + 1 : voteMeta.score - 1;

        if (isUpvote) {
            voteMeta.upvoters.push(VoterData(signals.epochKey, signals.epoch));
        } else {
            voteMeta.downvoters.push(VoterData(signals.epochKey, signals.epoch));
        }
    }

    function rewardVoters(VoterData[] memory voterDataList) internal {
        for (uint256 k = 0; k <= voterDataList.length; k++) {
            unirep.attest(
                voterDataList[k].epochKey,
                voterDataList[k].epoch,
                posRepFieldIndex,
                voterReward
            );
        }
    }

    // @dev need to test gas fee in testnet, theoretically this should not be too expensive since removing data will refund gas
    function tallyVotesForPersona(Persona storage persona) internal {
        for (uint256 i = 0; i <= persona.proposedPostlist.length; i++) {
            bytes32 postHash = persona.proposedPostlist[i];
            PostData storage postData = persona.proposedPosts[postHash];
            VoteMeta storage postVoteMeta = persona.votesByMessageHash[postHash];

            if (postVoteMeta.total < 3 || postVoteMeta.score == 0) {
                unirep.attest(
                    postData.epochKey,
                    postData.epoch,
                    posRepFieldIndex,
                    postRep
                );
            } else if (postVoteMeta.score > 0) {
                unirep.attest(
                    postData.epochKey,
                    postData.epoch,
                    posRepFieldIndex,
                    postRep * 2
                );
                rewardVoters(postVoteMeta.upvoters);
            } else if (postVoteMeta.score < 0) {
                rewardVoters(postVoteMeta.downvoters);
            }

            delete persona.proposedPostlist[i];
            delete persona.proposedPosts[postHash];
            delete persona.votesByMessageHash[postHash];
        }

        for (uint256 j = 0; j <= persona.proposedCommentlist.length; j++) {
            bytes32 commentHash = persona.proposedCommentlist[j];
            PostData storage commentData = persona.proposedComments[commentHash];
            VoteMeta storage commentVoteMeta = persona.votesByMessageHash[commentHash];

            if (commentVoteMeta.total < 3 || commentVoteMeta.score == 0) {
                unirep.attest(
                    commentData.epochKey,
                    commentData.epoch,
                    posRepFieldIndex,
                    commentRep
                );
            } else if (commentVoteMeta.score > 0) {
                unirep.attest(
                    commentData.epochKey,
                    commentData.epoch,
                    posRepFieldIndex,
                    commentRep * 2
                );
                rewardVoters(commentVoteMeta.upvoters);
            } else if (commentVoteMeta.score < 0) {
                rewardVoters(commentVoteMeta.downvoters);
            }

            delete persona.proposedCommentlist[j];
            delete persona.proposedComments[commentHash];
            delete persona.votesByMessageHash[commentHash];
        }
    }

    function finalizeEpochIfNeeded(uint256 epoch) public {
        if (epoch < attesterCurrentEpoch()) {
            for (uint256 i = 0; i <= personaList.length; i++) {
                Persona storage persona = personas[personaList[i]];
                tallyVotesForPersona(persona);
            }
        }
    }
}