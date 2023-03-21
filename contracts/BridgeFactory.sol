// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./WERC.sol";

// TODO: Create interface for the bridge; Add events in the interface
/**
 * @title EVM ERC20 Token Bridge
 * @author Danail Vasilev
 * @notice This is a 2-way ERC20 token bridge. Used "lock-mint" "release-burn" pattern.
 */
contract BridgeFactory is Ownable {
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
    // TODO: Make method payable; Add bridge tax requirement
    function lockToken(WERC tokenAddress, uint256 tokenAmount) external {
        /**
         * TODO:
         * 1) Can we approve the owner of the bridge instead of the bridge itself ?
         * 2) Use permits instead of approve
         * 3) Do we expect to have already approved amount ? Should we amend the currently approved amount or override it?
         */
        // Approve already emits event, no need to do it here.
        tokenAddress.approve(msg.sender, address(this), tokenAmount);

        // 1) Access token and transfer token ownership
        tokenAddress.transferFrom(msg.sender, address(this), tokenAmount);
        // 2) Update bridge data
        // TODO: Use msg.sender from Context ?
        // TODO: Should we avoid shorthand because of gas efficiency ?
        lockedTokens[msg.sender][address(tokenAddress)] += tokenAmount;
        // 3) Emit event
    }

    // Offchain action dispatched by the backend
    function mintToken(
        WERC tokenAddress,
        uint256 tokenAmount,
        address sender
    ) external {
        // 1) Verify signature
        // 2) Mint token, the bridge needs a minting role;
        // TODO: Add minter role to the bridge when deploying
        tokenAddress.mint(address(this), tokenAmount);
        // 3) Update Bridge data
        claimableTokens[sender][address(tokenAddress)] += tokenAmount;
        // 4) Emit event
    }

    // User claim action
    function releaseToken(WERC tokenAddress, uint256 tokenAmount) external {
        // 1) Change token amount ownership from bridge to user
        tokenAddress.transfer(msg.sender, tokenAmount);
        // 2) Update bridge data
        claimableTokens[msg.sender][address(tokenAddress)] -= tokenAmount;
        // 3) Emit event
    }

    // Offchain action dispatched by the backend
    function burnToken(
        WERC tokenAddress,
        uint256 tokenAmount,
        address sender
    ) external {
        // 1) Verify signature
        // 2) Burn token
        tokenAddress.burn(tokenAmount);
        // 3) Update bridge data
        lockedTokens[sender][address(tokenAddress)] -= tokenAmount;
        // Emit event
    }
}
// TODO: What If I lock-mint tokens but want to revert that ?
