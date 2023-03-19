// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./WERC.sol";

/**
 * @title EVM ERC20 Token Bridge
 * @author Danail Vasilev
 * @notice This is a 2-way ERC20 token bridge. Used "lock-mint", "release-burn" approach.
 */
contract BridgeFactory is Ownable {
    // For n-way bridge we can use struct to store tokenAmount and source chainId. The struct should not contain
    // the tokenAddress because it's already contained in the map as a key, so we can save memory.
    // For a 2-way bridge the following data structure and property names seem fine.
    // mapping(userAddress => mapping(tokenAddress => tokenAmount))
    mapping(address => mapping(address => uint256)) lockedTokens;
    mapping(address => mapping(address => uint256)) claimableTokens;

    // TODO: Add history. We can store block numbers that have events, to avoid iteration over all blocks;
    // The graph can be used as well;

    // Permit token and transfer token should happen in a single transaction in order to reduce gas fees.
    // Bridge tax is collected here, from a single point.
    // TODO: Add bridge tax requirement
    function send(WERC tokenAddress, uint256 tokenAmount) external {
        permitToken(tokenAddress, tokenAmount);
        lockToken(tokenAddress, tokenAmount);
    }

    function permitToken(WERC tokenAddress, uint256 tokenAmount) internal {
        // Approve already emits event, no need to do it here.
        // TODO: Use permit instead of approve
        // TODO: What if we have already approved amount ? Should we extend the currently approved amount or override it?
        tokenAddress.approve(msg.sender, owner(), tokenAmount);
    }

    function lockToken(WERC tokenAddress, uint256 tokenAmount) internal {
        // 1) Update bridge data
        // TODO: Use msg.sender from Context ?
        lockedTokens[msg.sender][address(tokenAddress)] =
            lockedTokens[msg.sender][address(tokenAddress)] +
            tokenAmount;
        // 2) Access token and transfer token ownership
        tokenAddress.transferFrom(msg.sender, owner(), tokenAmount);
        // 3) Emit event
        // TODO: Do we need Bridge specific event or the one from transferFrom is fine ?
    }

    // Offchain action dispatched by the backend
    // TODO: Add signature, chainId ?
    // TODO: What's better to pass tokenAddress or set it in the contract?
    function mintToken(
        WERC tokenAddress,
        uint256 tokenAmount,
        address sender
    ) external {
        // TODO: Verify tokenAddress exists?
        // 1) Verify signature
        // In order to mint the bridge has to be the owner of the token
        // 2) Mint token, the owner is still the bridge
        tokenAddress.mint(owner(), tokenAmount);
        // 3) Update Bridge data
        // TODO: Test the short hand +=
        claimableTokens[sender][address(tokenAddress)] =
            claimableTokens[sender][address(tokenAddress)] +
            tokenAmount;
        // 4) Emit event
    }

    function releaseToken(WERC tokenAddress, uint256 tokenAmount) external {
        // 1) Verify signature
        // 2) Release
        // Change token amount ownership from bridge to user
        tokenAddress.transferFrom(owner(), msg.sender, tokenAmount);
        // Update bridge data
        claimableTokens[msg.sender][address(tokenAddress)] =
            claimableTokens[msg.sender][address(tokenAddress)] -
            tokenAmount;
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
        // 2) Update bridge data
        lockedTokens[sender][address(tokenAddress)] =
            lockedTokens[sender][address(tokenAddress)] -
            tokenAmount;
        // Emit event
    }
    // Events
}
// TODO: What If I lock-mint tokens but want to revert that ?
