// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";

// TODO: Check contract name;
// TODO: Who should be de deployer of the contract - owner or the bridge ?
contract WERC is ERC20PresetMinterPauser {
    constructor() ERC20PresetMinterPauser("Wrapped ERC", "WERC") {}

    // TODO: This is not safe as anyone can pass the owner. Remove and switch to permit (PermitWERC)
    function approve(address owner, address spender, uint256 value) external {
        _approve(owner, spender, value);
    }
}
