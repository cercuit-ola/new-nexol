// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NexolEscrow is Ownable2Step, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum Status { None, Funded, WorkSubmitted, Released, Refunded, Disputed, Resolved }

    struct Escrow {
        address payer;
        address payee;
        address token;
        uint128 amount;
        uint64 deadline;
        Status status;
        bytes32 metadataHash;
    }

    uint256 public nextEscrowId = 1;
    mapping(uint256 => Escrow) public escrows;
    mapping(address => bool) public supportedTokens;
    mapping(address => uint256[]) private _userEscrowIds;

    event SupportedTokenSet(address indexed token, bool supported);
    event EscrowFunded(uint256 indexed escrowId, address indexed payer, address indexed payee, address token, uint256 amount, uint64 deadline, bytes32 metadataHash);
    event WorkSubmitted(uint256 indexed escrowId, bytes32 indexed evidenceHash);
    event EscrowReleased(uint256 indexed escrowId, address indexed payee, uint256 amount);
    event EscrowRefunded(uint256 indexed escrowId, address indexed payer, uint256 amount);
    event DisputeRaised(uint256 indexed escrowId, address indexed raisedBy, bytes32 indexed reasonHash);
    event DisputeResolved(uint256 indexed escrowId, uint256 payerAmount, uint256 payeeAmount);

    error InvalidAddress();
    error InvalidAmount();
    error InvalidDeadline();
    error UnsupportedToken();
    error Unauthorized();
    error InvalidStatus();
    error InvalidSplit();
    error FeeOnTransferTokenNotSupported();

    constructor(address initialOwner) Ownable(initialOwner) {
        if (initialOwner == address(0)) revert InvalidAddress();
    }

    function setSupportedToken(address token, bool supported) external onlyOwner {
        if (token == address(0)) revert InvalidAddress();
        supportedTokens[token] = supported;
        emit SupportedTokenSet(token, supported);
    }

    function createEscrow(address payee, address token, uint128 amount, uint64 deadline, bytes32 metadataHash)
        external nonReentrant whenNotPaused returns (uint256 escrowId)
    {
        if (payee == address(0) || payee == msg.sender) revert InvalidAddress();
        if (!supportedTokens[token]) revert UnsupportedToken();
        if (amount == 0) revert InvalidAmount();
        if (deadline != 0 && deadline <= block.timestamp) revert InvalidDeadline();

        IERC20 asset = IERC20(token);
        uint256 beforeBalance = asset.balanceOf(address(this));
        asset.safeTransferFrom(msg.sender, address(this), amount);
        if (asset.balanceOf(address(this)) - beforeBalance != amount) revert FeeOnTransferTokenNotSupported();

        escrowId = nextEscrowId++;
        escrows[escrowId] = Escrow(msg.sender, payee, token, amount, deadline, Status.Funded, metadataHash);
        _userEscrowIds[msg.sender].push(escrowId);
        _userEscrowIds[payee].push(escrowId);
        emit EscrowFunded(escrowId, msg.sender, payee, token, amount, deadline, metadataHash);
    }

    function submitWork(uint256 escrowId, bytes32 evidenceHash) external whenNotPaused {
        Escrow storage escrow = escrows[escrowId];
        if (msg.sender != escrow.payee) revert Unauthorized();
        if (escrow.status != Status.Funded) revert InvalidStatus();
        escrow.status = Status.WorkSubmitted;
        emit WorkSubmitted(escrowId, evidenceHash);
    }

    function release(uint256 escrowId) external nonReentrant whenNotPaused {
        Escrow storage escrow = escrows[escrowId];
        if (msg.sender != escrow.payer) revert Unauthorized();
        if (escrow.status != Status.Funded && escrow.status != Status.WorkSubmitted) revert InvalidStatus();
        escrow.status = Status.Released;
        IERC20(escrow.token).safeTransfer(escrow.payee, escrow.amount);
        emit EscrowReleased(escrowId, escrow.payee, escrow.amount);
    }

    function refund(uint256 escrowId) external nonReentrant whenNotPaused {
        Escrow storage escrow = escrows[escrowId];
        if (msg.sender != escrow.payee) revert Unauthorized();
        if (escrow.status != Status.Funded && escrow.status != Status.WorkSubmitted) revert InvalidStatus();
        escrow.status = Status.Refunded;
        IERC20(escrow.token).safeTransfer(escrow.payer, escrow.amount);
        emit EscrowRefunded(escrowId, escrow.payer, escrow.amount);
    }

    function raiseDispute(uint256 escrowId, bytes32 reasonHash) external whenNotPaused {
        Escrow storage escrow = escrows[escrowId];
        if (msg.sender != escrow.payer && msg.sender != escrow.payee) revert Unauthorized();
        if (escrow.status != Status.Funded && escrow.status != Status.WorkSubmitted) revert InvalidStatus();
        escrow.status = Status.Disputed;
        emit DisputeRaised(escrowId, msg.sender, reasonHash);
    }

    function resolveDispute(uint256 escrowId, uint128 payerAmount, uint128 payeeAmount) external onlyOwner nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        if (escrow.status != Status.Disputed) revert InvalidStatus();
        if (uint256(payerAmount) + uint256(payeeAmount) != escrow.amount) revert InvalidSplit();
        escrow.status = Status.Resolved;
        IERC20 asset = IERC20(escrow.token);
        if (payerAmount > 0) asset.safeTransfer(escrow.payer, payerAmount);
        if (payeeAmount > 0) asset.safeTransfer(escrow.payee, payeeAmount);
        emit DisputeResolved(escrowId, payerAmount, payeeAmount);
    }

    function getUserEscrowIds(address user) external view returns (uint256[] memory) { return _userEscrowIds[user]; }
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
