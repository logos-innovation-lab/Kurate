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

    uint160 attesterId;

    // Positive Reputation field index in Kurate
    uint256 immutable public posRepFieldIndex = 0;

    // Nagative Reputation field index in Kurate
    uint256 immutable public negRepFieldIndex = 1;

    uint256 immutable public postRep = 5;
    uint256 immutable public commentRep = 3;

    Unirep public unirep;

    mapping(uint256 => Persona) public personas;
    uint256[] public personaList;

    mapping(uint256 => mapping(uint256 => bool)) public membersByPersona;

    event NewPersona(uint256 personaId);
    event NewPersonaMember(uint256 personaId, uint256 identityCommitment);

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
        bytes32 name,
        bytes memory profileImage,
        bytes memory coverImage,
        bytes32 pitch,
        bytes32 description,
        bytes32[5] memory seedPosts,
        uint256[] memory publicSignals,
        uint256[8] memory proof
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
        persona.seedPosts = seedPosts;

        personaList.push(personaId);

        emit NewPersona(personaId);
    }

    // @dev Required ZK Proof for first time joining a group.
    function joinPersona(
        uint256 personaId,
        uint256[] memory publicSignals,
        uint256[8] memory proof
    ) external {
        uint256 identityCommitment = publicSignals[0];
        uint256 _attesterId = publicSignals[2];

        require(_attesterId == attesterId, 'attester id is invalid');

        if (membersByPersona[personaId][identityCommitment]) {
            revert MemberAlreadyJoined();
        }

        unirep.userSignUp(publicSignals, proof);

        membersByPersona[personaId][identityCommitment] = true;

        emit NewPersonaMember(personaId, identityCommitment);
    }

    // @dev use this method if the user already joined a persona before
    function joinPersona(
        uint256 personaId,
        uint256 identityCommitment
    ) external {
        // TODO: need to check for global signup
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

        uint256 minRep = signals.minRep;
        require(signals.attesterId == attesterId, 'invalid attester id');
        require(minRep >= postRep, "not enough reputation");

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

        uint256 minRep = signals.minRep;
        require(signals.attesterId == attesterId, 'invalid attester id');
        require(minRep >= commentRep, "not enough reputation");

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
        bool isUpvote
    ) onlyAdmin external  {
        Persona storage persona = personas[personaId];

        if (persona.proposedPosts[messageHash].hash == bytes32(0)) {
            revert MessageNotExist();
        }

        VoteMeta storage voteMeta = persona.votesByMessageHash[messageHash];
        voteMeta.total = voteMeta.total + 1;
        voteMeta.score = isUpvote ? voteMeta.score + 1 : voteMeta.score - 1;
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
            }

            delete persona.proposedPostlist[i];
            delete persona.proposedPosts[postHash];
            delete persona.votesByMessageHash[postHash];
        }

        for (uint256 j = 0; j <= persona.proposedCommentlist.length; j++) {
            bytes32 commenHash = persona.proposedCommentlist[j];
            PostData storage commenData = persona.proposedComments[commenHash];
            VoteMeta storage commenVoteMeta = persona.votesByMessageHash[commenHash];

            if (commenVoteMeta.total < 3 || commenVoteMeta.score == 0) {
                unirep.attest(
                    commenData.epochKey,
                        commenData.epoch,
                    posRepFieldIndex,
                    commentRep
                );
            } else if (commenVoteMeta.score > 0) {
                unirep.attest(
                    commenData.epochKey,
                        commenData.epoch,
                    posRepFieldIndex,
                    commentRep * 2
                );
            }

            delete persona.proposedCommentlist[j];
            delete persona.proposedComments[commenHash];
            delete persona.votesByMessageHash[commenHash];
        }
    }

    function finalizeEpoch() public {
        for (uint256 i = 0; i <= personaList.length; i++) {
            Persona storage persona = personas[personaList[i]];
            tallyVotesForPersona(persona);
        }
    }
}