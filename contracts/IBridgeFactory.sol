// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./WERC.sol";

interface IBridgeFactory {
    // User address, token address, amount
    event TokensLocked(address, address, uint256);
    // User address, token address, amount
    event TokensMinted(address, address, uint256);
    // User address, token address, amount
    event TokensReleased(address, address, uint256);
    // User address, token address, amount
    event TokensBurnt(address, address, uint256);

    function getLockedTokensAmount(
        address user,
        address token
    ) external view returns (uint256);

    function getClaimableTokensAmount(
        address user,
        address token
    ) external view returns (uint256);

    function lockToken(WERC tokenAddress, uint256 tokenAmount) external;

    function mintToken(
        WERC tokenAddress,
        uint256 tokenAmount,
        address sender
    ) external;

    function releaseToken(WERC tokenAddress, uint256 tokenAmount) external;

    function burnToken(
        WERC tokenAddress,
        uint256 tokenAmount,
        address sender
    ) external;
}
