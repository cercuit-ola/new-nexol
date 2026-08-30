// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NexolScheduler is Ownable2Step, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum Status { None, Active, Completed, Cancelled }
    struct Schedule {
        address payer;
        address recipient;
        address token;
        uint128 totalAmount;
        uint128 installmentAmount;
        uint64 startTime;
        uint32 intervalSeconds;
        uint16 installmentCount;
        uint16 releasedCount;
        Status status;
        bytes32 metadataHash;
    }

    uint256 public nextScheduleId = 1;
    mapping(uint256 => Schedule) public schedules;
    mapping(address => bool) public supportedTokens;
    mapping(address => uint256[]) private _userScheduleIds;

    event SupportedTokenSet(address indexed token, bool supported);
    event ScheduleCreated(uint256 indexed scheduleId, address indexed payer, address indexed recipient, address token, uint256 totalAmount, uint256 installmentAmount, uint64 startTime, uint32 intervalSeconds, uint16 installmentCount, bytes32 metadataHash);
    event PaymentReleased(uint256 indexed scheduleId, uint16 indexed installmentNumber, uint256 amount, uint64 nextReleaseTime);
    event ScheduleCancelled(uint256 indexed scheduleId, uint256 refundedAmount);

    error InvalidAddress();
    error InvalidConfiguration();
    error UnsupportedToken();
    error Unauthorized();
    error InvalidStatus();
    error PaymentNotDue();
    error FeeOnTransferTokenNotSupported();

    constructor(address initialOwner) Ownable(initialOwner) {
        if (initialOwner == address(0)) revert InvalidAddress();
    }

    function setSupportedToken(address token, bool supported) external onlyOwner {
        if (token == address(0)) revert InvalidAddress();
        supportedTokens[token] = supported;
        emit SupportedTokenSet(token, supported);
    }

    function createSchedule(address recipient, address token, uint128 totalAmount, uint64 startTime, uint32 intervalSeconds, uint16 installmentCount, bytes32 metadataHash)
        external nonReentrant whenNotPaused returns (uint256 scheduleId)
    {
        if (recipient == address(0) || recipient == msg.sender) revert InvalidAddress();
        if (!supportedTokens[token]) revert UnsupportedToken();
        if (totalAmount == 0 || installmentCount == 0 || intervalSeconds == 0 || startTime < block.timestamp || totalAmount < installmentCount) revert InvalidConfiguration();

        IERC20 asset = IERC20(token);
        uint256 beforeBalance = asset.balanceOf(address(this));
        asset.safeTransferFrom(msg.sender, address(this), totalAmount);
        if (asset.balanceOf(address(this)) - beforeBalance != totalAmount) revert FeeOnTransferTokenNotSupported();

        scheduleId = nextScheduleId++;
        uint128 installmentAmount = totalAmount / installmentCount;
        schedules[scheduleId] = Schedule(msg.sender, recipient, token, totalAmount, installmentAmount, startTime, intervalSeconds, installmentCount, 0, Status.Active, metadataHash);
        _userScheduleIds[msg.sender].push(scheduleId);
        _userScheduleIds[recipient].push(scheduleId);
        emit ScheduleCreated(scheduleId, msg.sender, recipient, token, totalAmount, installmentAmount, startTime, intervalSeconds, installmentCount, metadataHash);
    }

    function nextReleaseTime(uint256 scheduleId) public view returns (uint64) {
        Schedule storage schedule = schedules[scheduleId];
        return schedule.startTime + uint64(schedule.intervalSeconds) * schedule.releasedCount;
    }

    function releasable(uint256 scheduleId) public view returns (bool) {
        Schedule storage schedule = schedules[scheduleId];
        return schedule.status == Status.Active && schedule.releasedCount < schedule.installmentCount && block.timestamp >= nextReleaseTime(scheduleId);
    }

    function executePayment(uint256 scheduleId) public nonReentrant whenNotPaused {
        Schedule storage schedule = schedules[scheduleId];
        if (schedule.status != Status.Active) revert InvalidStatus();
        if (!releasable(scheduleId)) revert PaymentNotDue();

        uint16 installmentNumber = schedule.releasedCount + 1;
        uint256 amount = installmentNumber == schedule.installmentCount
            ? uint256(schedule.totalAmount) - uint256(schedule.installmentAmount) * schedule.releasedCount
            : schedule.installmentAmount;
        schedule.releasedCount = installmentNumber;
        if (installmentNumber == schedule.installmentCount) schedule.status = Status.Completed;
        IERC20(schedule.token).safeTransfer(schedule.recipient, amount);
        emit PaymentReleased(scheduleId, installmentNumber, amount, schedule.status == Status.Active ? nextReleaseTime(scheduleId) : 0);
    }

    function cancelSchedule(uint256 scheduleId) external nonReentrant {
        Schedule storage schedule = schedules[scheduleId];
        if (msg.sender != schedule.payer) revert Unauthorized();
        if (schedule.status != Status.Active) revert InvalidStatus();
        uint256 released = uint256(schedule.installmentAmount) * schedule.releasedCount;
        uint256 refundAmount = uint256(schedule.totalAmount) - released;
        schedule.status = Status.Cancelled;
        IERC20(schedule.token).safeTransfer(schedule.payer, refundAmount);
        emit ScheduleCancelled(scheduleId, refundAmount);
    }

    // Register an upkeep with checkData = abi.encode(scheduleId).
    function checkUpkeep(bytes calldata checkData) external view returns (bool upkeepNeeded, bytes memory performData) {
        uint256 scheduleId = abi.decode(checkData, (uint256));
        upkeepNeeded = releasable(scheduleId);
        performData = checkData;
    }

    function performUpkeep(bytes calldata performData) external { executePayment(abi.decode(performData, (uint256))); }
    function getUserScheduleIds(address user) external view returns (uint256[] memory) { return _userScheduleIds[user]; }
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
