// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Leaderboard is Ownable, EIP712 {
    using ECDSA for bytes32;

    bytes32 private constant SCORE_TYPEHASH =
        keccak256("Score(address player,uint256 score,uint256 nonce,uint256 deadline)");

    address public scoreSigner;
    mapping(address => uint256) public bestScore;
    mapping(bytes32 => bool) public usedNonces;
    address[] private _players;
    mapping(address => bool) private _isPlayer;
    uint256 public season;

    event ScoreSubmitted(address indexed player, uint256 score, uint256 indexed season);
    event NewHighScore(address indexed player, uint256 score, uint256 indexed season);
    event SeasonReset(uint256 indexed newSeason);
    event SignerUpdated(address indexed newSigner);

    error InvalidSignature();
    error NonceUsed();
    error DeadlinePassed();

    constructor(address initialOwner, address initialSigner)
        Ownable(initialOwner)
        EIP712("ArcMiniArcade", "1")
    {
        scoreSigner = initialSigner;
        season = 1;
    }

    function submitScore(
        uint256 score,
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) external {
        if (block.timestamp > deadline) revert DeadlinePassed();

        bytes32 nonceKey = keccak256(abi.encode(msg.sender, nonce, season));
        if (usedNonces[nonceKey]) revert NonceUsed();

        bytes32 structHash = keccak256(
            abi.encode(SCORE_TYPEHASH, msg.sender, score, nonce, deadline)
        );
        bytes32 digest = _hashTypedDataV4(structHash);
        address recovered = digest.recover(signature);
        if (recovered != scoreSigner) revert InvalidSignature();

        usedNonces[nonceKey] = true;

        if (!_isPlayer[msg.sender]) {
            _isPlayer[msg.sender] = true;
            _players.push(msg.sender);
        }

        emit ScoreSubmitted(msg.sender, score, season);

        if (score > bestScore[msg.sender]) {
            bestScore[msg.sender] = score;
            emit NewHighScore(msg.sender, score, season);
        }
    }

    function setScoreSigner(address newSigner) external onlyOwner {
        scoreSigner = newSigner;
        emit SignerUpdated(newSigner);
    }

    function resetSeason() external onlyOwner {
        season += 1;
        delete _players;
        emit SeasonReset(season);
    }

    function playerCount() external view returns (uint256) {
        return _players.length;
    }

    function playerAt(uint256 index) external view returns (address) {
        return _players[index];
    }
}
