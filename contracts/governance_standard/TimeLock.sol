// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/governance/TimelockController.sol";

contract TimeLock is TimelockController {
    constructor(
        uint256 minDelay, //How long before executing
        address[] memory proposers, //List of addresses that can propose
        address[] memory executors, //Who can execute when a proposal passes
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {}
}
