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
    mapping(bytes32 => bool) public publishedMessage;

    mapping(uint256 => mapping(bytes32 => MessageData)) public proposedMessageByEpoch;
    mapping(uint256 => bytes32[]) public proposedMessageListByEpoch;
    mapping(bytes32 => VoteMeta) voteMetadataByMessageHash;

    event NewPersona(uint256 personaId);
    event NewPersonaMember(uint256 indexed personaId, uint256 identityCommitment);
    event NewProposedMessage(uint256 indexed personaId, bytes32 messageHash);
    event NewPersonaMessage(uint256 indexed personaId, bytes32 messageHash);

    /// Restricted to members of the admin role.
    modifier onlyAdmin() {
        require(msg.sender == admin, "Restricted to admin.");
        _;
    }

    constructor(
        address _unirepAddress,
        uint256 epochLength
    ) {
        unirep = Unirep(_unirepAddress);
        unirep.attesterSignUp(epochLength); // 86400 (1d) for prod, suggest 120 (2m) for dev on ganache
        attesterId = uint160(address(this));
        admin = msg.sender;
    }

    function attesterCurrentEpoch() public view returns (uint256) {
        return unirep.attesterCurrentEpoch(attesterId);
    }

    function attesterEpochRemainingTime() public view returns (uint256) {
        return unirep.attesterEpochRemainingTime(attesterId);
    }

    function sealEpoch(
        uint256 epoch,
        uint256[] memory publicSignals,
        uint256[8] memory proof
    ) external {
        require(epoch < attesterCurrentEpoch(), 'epoch must be less than current epoch');

        bytes32[] memory messages = proposedMessageListByEpoch[epoch];

        for (uint256 i = 0; i < messages.length; i++) {
            MessageData memory msgData = proposedMessageByEpoch[epoch][messages[i]];
            VoteMeta memory voteMeta = voteMetadataByMessageHash[msgData.hash];

            uint256 totalVotes = voteMeta.downvoters.length + voteMeta.upvoters.length;
            bool isResultPositive = voteMeta.upvoters.length > voteMeta.downvoters.length;

            if (totalVotes >= 3 && isResultPositive) {
                publishedMessage[msgData.hash] = true;
                emit NewPersonaMessage(msgData.personaId, msgData.hash);
            }

            delete voteMetadataByMessageHash[msgData.hash];
            delete proposedMessageByEpoch[epoch][messages[i]];
        }

        delete proposedMessageListByEpoch[epoch];

        unirep.sealEpoch(epoch, attesterId, publicSignals, proof);
    }

    function userStateTransition(
        uint256[] memory publicSignals,
        uint256[8] memory proof
    ) external {
        unirep.userStateTransition(publicSignals, proof);
    }

    function grantReputation(
        uint256 rep,
        uint256[] memory publicSignals,
        uint256[8] memory proof
    ) onlyAdmin external {
        IUnirep.ReputationSignals memory signals = unirep.decodeReputationSignals(
            publicSignals
        );

        unirep.verifyReputationProof(publicSignals, proof);

        unirep.attest(
            signals.epochKey,
            signals.epoch,
            posRepFieldIndex,
            rep
        );
    }

    function slashReputation(
        uint256 rep,
        uint256[] memory publicSignals,
        uint256[8] memory proof
    ) onlyAdmin external {
        IUnirep.ReputationSignals memory signals = unirep.decodeReputationSignals(
            publicSignals
        );

        unirep.verifyReputationProof(publicSignals, proof);

        unirep.attest(
            signals.epochKey,
            signals.epoch,
            negRepFieldIndex,
            rep
        );
    }

    function createPersona(
        string memory name,
        string memory profileImage,
        string memory coverImage,
        bytes32 pitch,
        bytes32 description,
        bytes32[5] memory seedPosts,
        uint256[] memory publicSignals,
        uint256[8] memory proof
    ) onlyAdmin external {
        uint personaId = personaList.length;

        IUnirep.ReputationSignals memory signals = unirep.decodeReputationSignals(
            publicSignals
        );

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
            publishedMessage[seedPosts[i]] = true;
            emit NewPersonaMessage(personaId, seedPosts[i]);
        }
    }

    function createPersona(
        string memory name,
        string memory profileImage,
        string memory coverImage,
        bytes32 pitch,
        bytes32 description,
        bytes32[5] memory seedPosts
    ) onlyAdmin external {
        uint personaId = personaList.length;

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
            publishedMessage[seedPosts[i]] = true;
            emit NewPersonaMessage(personaId, seedPosts[i]);
        }
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

    function proposeMessage(
        uint256 personaId,
        MessageType messageType,
        bytes32 messageHash,
        uint256[] memory publicSignals,
        uint256[8] memory proof
    ) onlyAdmin external payable {
        IUnirep.ReputationSignals memory signals = unirep.decodeReputationSignals(
            publicSignals
        );

        uint256 epoch = signals.epoch;

        require(epoch == attesterCurrentEpoch(), 'epoch does not match');

        if (proposedMessageByEpoch[epoch][messageHash].hash != bytes32(0)) {
            revert MessageAlreadyExist();
        }

        if (publishedMessage[messageHash]) {
            revert MessageAlreadyExist();
        }


        uint256 minRep = signals.minRep;

        if (messageType == MessageType.Post) {
            require(minRep >= postRep, "not enough reputation");
        } else if (messageType == MessageType.Comment) {
            require(minRep >= commentRep, "not enough reputation");
        }

        unirep.verifyReputationProof(publicSignals, proof);

        proposedMessageByEpoch[epoch][messageHash] = MessageData(
            messageType,
            messageHash,
            signals.epochKey,
            signals.epoch,
            personaId,
            false
        );

        proposedMessageListByEpoch[epoch].push(messageHash);

        emit NewProposedMessage(personaId, messageHash);
    }

    function proposeMessage(
        uint256 personaId,
        MessageType messageType,
        bytes32 messageHash
    ) onlyAdmin external payable {
        uint256 epoch = attesterCurrentEpoch();

        if (proposedMessageByEpoch[epoch][messageHash].hash != bytes32(0)) {
            revert MessageAlreadyExist();
        }

        if (publishedMessage[messageHash]) {
            revert MessageAlreadyExist();
        }

        proposedMessageByEpoch[epoch][messageHash] = MessageData(
            messageType,
            messageHash,
            0,
            epoch,
            personaId,
            true
        );

        proposedMessageListByEpoch[epoch].push(messageHash);

        emit NewProposedMessage(personaId, messageHash);
    }

    function vote(
        bytes32 messageHash,
        bool isUpvote,
        uint256[] memory publicSignals,
        uint256[8] memory proof
    ) onlyAdmin external  {
        IUnirep.ReputationSignals memory signals = unirep.decodeReputationSignals(
            publicSignals
        );

        uint256 epoch = signals.epoch;

        require(epoch == attesterCurrentEpoch(), 'epoch does not match current epoch');

        MessageData memory msgData = proposedMessageByEpoch[epoch][messageHash];

        require(epoch == msgData.epoch, 'epoch does not match message epoch');

        if (msgData.hash == bytes32(0)) {
            revert MessageNotExist();
        }

        unirep.verifyReputationProof(publicSignals, proof);

        VoteMeta storage voteMeta = voteMetadataByMessageHash[messageHash];

        uint256 total = voteMeta.upvoters.length + voteMeta.downvoters.length;
        bool isResultNeutral = total < 3 || voteMeta.upvoters.length == voteMeta.downvoters.length;
        bool isResultPositive = !isResultNeutral && voteMeta.upvoters.length > voteMeta.downvoters.length;

        if (isUpvote) {
            voteMeta.upvoters.push(VoterData(signals.epochKey, signals.epoch));
        } else {
            voteMeta.downvoters.push(VoterData(signals.epochKey, signals.epoch));
        }

        uint256 newTotal = voteMeta.upvoters.length + voteMeta.downvoters.length;
        bool isNewResultNeutral = total < 3 || voteMeta.upvoters.length == voteMeta.downvoters.length;
        bool isNewResultPositive = !isNewResultNeutral && voteMeta.upvoters.length > voteMeta.downvoters.length;
        bool hasFlip = isResultPositive != isNewResultPositive;

        uint256 reward = msgData.messageType == MessageType.Post ? postReward : commentReward;
        uint256 stake = msgData.messageType == MessageType.Post ? postRep : commentRep;

        // Reward/Slash OP
        if (!msgData.isAdmin) {
            if (newTotal == 3) {
                if (isNewResultPositive) {
                    unirep.attest(
                        msgData.epochKey,
                        msgData.epoch,
                        posRepFieldIndex,
                        reward
                    );
                } else {
                    unirep.attest(
                        msgData.epochKey,
                        msgData.epoch,
                        negRepFieldIndex,
                        stake
                    );
                }
            } else if (newTotal > 3) {
                if (hasFlip) {
                    if (isNewResultPositive) {
                        unirep.attest(
                            msgData.epochKey,
                            msgData.epoch,
                            posRepFieldIndex,
                            reward + stake
                        );
                    } else {
                        unirep.attest(
                            msgData.epochKey,
                            msgData.epoch,
                            negRepFieldIndex,
                            reward + stake
                        );
                    }
                }
            }
        }

        // Reward/Slash Voters
        if (newTotal == 3) {
            VoterData[] memory voters = isNewResultPositive ? voteMeta.upvoters : voteMeta.downvoters;
            for (uint256 i = 0; i < voters.length; i++) {
                VoterData memory voter = voters[i];
                unirep.attest(
                    voter.epochKey,
                    voter.epoch,
                    posRepFieldIndex,
                    voterReward
                );
            }
        } else if (newTotal > 3) {
            if (hasFlip) {
                VoterData[] memory slashedVoters = isNewResultPositive ? voteMeta.downvoters : voteMeta.upvoters;
                for (uint256 i = 0; i < slashedVoters.length - 1; i++) {
                    VoterData memory slashedVoter = slashedVoters[i];
                    unirep.attest(
                        slashedVoter.epochKey,
                        slashedVoter.epoch,
                        negRepFieldIndex,
                        voterReward
                    );
                }
            }

            if (isNewResultPositive == isUpvote) {
                unirep.attest(
                    signals.epochKey,
                    signals.epoch,
                    posRepFieldIndex,
                    voterReward
                );
            }
        }
    }
}