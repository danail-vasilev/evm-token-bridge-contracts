// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";

// Contract name can be renamed as currently it's not a wrapper.
// The deployer will be the owner for the current purpose, but it can be the bridge as well.
contract WERC is ERC20PresetMinterPauser {
    constructor() ERC20PresetMinterPauser("Wrapped ERC", "WERC") {}

    /**
     * TODO: This is not safe as anyone can pass the owner:
     *      1) Remove and switch to permit (PermitWERC)
     *      2) Or directly let the user do the permit from the UI side
     */
    function approve(address owner, address spender, uint256 value) external {
        _approve(owner, spender, value);
    }
}
