// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./WERC.sol";

import "./IBridgeFactory.sol";

/**
 * @title EVM ERC20 Token Bridge
 * @author Danail Vasilev
 * @notice This is a 2-way ERC20 token bridge. Used "lock-mint" "release-burn" pattern.
 */
contract BridgeFactory is IBridgeFactory, Ownable, ReentrancyGuard {
    // For n-way bridge we can use struct to store tokenAmount and source chainId. The struct should not contain
    // the tokenAddress because it's already contained in the map as a key, so we can save memory.
    // For a 2-way bridge the following data structure and property names seem fine.
    // mapping(userAddress => mapping(tokenAddress => tokenAmount))
    mapping(address => mapping(address => uint256)) lockedTokens;
    mapping(address => mapping(address => uint256)) claimableTokens;

    function getLockedTokensAmount(
        address user,
        address token
    ) external view returns (uint256) {
        return lockedTokens[user][token];
    }

    function getClaimableTokensAmount(
        address user,
        address token
    ) external view returns (uint256) {
        return claimableTokens[user][token];
    }

    // TODO: Add history. We can store block numbers that have events, to avoid iteration over all blocks;
    // The graph can be used as well;

    // Permit token and transfer token should happen in a single transaction in order to reduce gas fees.
    // Bridge tax is collected here, from a single point.
    // TODO: Make method payable; Add bridge tax requirement (e.g., 5-10$ in ETH for 300$)
    function lockToken(
        WERC tokenAddress,
        uint256 tokenAmount
    ) external nonReentrant {
        /**
         * TODO:
         * 1) Can we approve the owner of the bridge instead of the bridge itself ?
         *      - Same owner of token and bridge can be rare. Check Tether(USDT)
         * 2) Move that directly in the UI or use permits instead of approve. Signing is required only for permits. We can use the beta permit contract as well - ERC-2612
         * 3) Do we expect to have already approved amount ? Should we amend the currently approved amount or override it?
         */
        // Approve already emits event, no need to do it here.
        tokenAddress.approve(_msgSender(), address(this), tokenAmount);

        // 1) Access token and transfer token ownership
        tokenAddress.transferFrom(_msgSender(), address(this), tokenAmount);
        // 2) Update bridge data
        // TODO: Should we avoid shorthand because of gas efficiency ?
        lockedTokens[_msgSender()][address(tokenAddress)] += tokenAmount;
        // 3) Emit event
        emit TokensLocked(_msgSender(), address(tokenAddress), tokenAmount);
    }

    // TODO: Add list of token addresses; Add method that adds token
    // TODO: Add target chain id method for the UI side

    // Offchain action dispatched by the backend
    // It's ok to add reentrancy to all methods despite some may not require it.
    function mintToken(
        WERC tokenAddress,
        uint256 tokenAmount,
        address sender
    ) external onlyOwner nonReentrant {
        // 1) Verify signature
        // 2) Mint token, the bridge needs a minting role;
        // TODO: Add minter role to the bridge when deploying
        tokenAddress.mint(address(this), tokenAmount);
        // 3) Update Bridge data
        claimableTokens[sender][address(tokenAddress)] += tokenAmount;
        // 4) Emit event
        emit TokensMinted(sender, address(tokenAddress), tokenAmount);
    }

    // User claim action
    function releaseToken(
        WERC tokenAddress,
        uint256 tokenAmount
    ) external nonReentrant {
        // 1) Change token amount ownership from bridge to user
        tokenAddress.transfer(_msgSender(), tokenAmount);
        // 2) Update bridge data
        claimableTokens[_msgSender()][address(tokenAddress)] -= tokenAmount;
        // 3) Emit event
        emit TokensReleased(_msgSender(), address(tokenAddress), tokenAmount);
    }

    // Offchain action dispatched by the backend
    function burnToken(
        WERC tokenAddress,
        uint256 tokenAmount,
        address sender
    ) external onlyOwner nonReentrant {
        // 1) Verify signature
        // 2) Burn token
        tokenAddress.burn(tokenAmount);
        // 3) Update bridge data
        lockedTokens[sender][address(tokenAddress)] -= tokenAmount;
        // 4) Emit event
        emit TokensBurnt(sender, address(tokenAddress), tokenAmount);
    }
}
// What If I lock-mint tokens but want to revert that ?
// Not needed as an requirement but it's a usual case
