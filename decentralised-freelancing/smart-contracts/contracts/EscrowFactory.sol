// contracts/EscrowFactory.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Escrow.sol";

/**
 * @title EscrowFactory
 * @dev Deploys a new Escrow contract for each hired project
 * Acts as the registry of all escrows on the platform
 */
contract EscrowFactory {

    // ── State ────────────────────────────────────────────────────

    address public owner;           // platform owner
    address public platformWallet;  // receives platform fees
    uint256 public platformFee;     // fee % (default 5%)
    uint256 public escrowCount;     // total escrows created

    // Maps projectId → escrow contract address
    mapping(string => address) public projectEscrows;

    // Maps wallet address → all their escrow addresses
    mapping(address => address[]) public userEscrows;

    // All escrow addresses ever created
    address[] public allEscrows;

    // ── Events ───────────────────────────────────────────────────

    event EscrowCreated(
        address indexed escrowAddress,
        address indexed client,
        address indexed freelancer,
        string  projectId,
        uint256 timestamp
    );

    event PlatformFeeUpdated(uint256 newFee);
    event PlatformWalletUpdated(address newWallet);

    // ── Modifiers ────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    // ── Constructor ──────────────────────────────────────────────

    /**
     * @param _platformWallet  Where platform fees go
     * @param _platformFee     Fee percentage (e.g. 5 for 5%)
     */
    constructor(address _platformWallet, uint256 _platformFee) {
        require(_platformWallet != address(0), "Invalid platform wallet");
        require(_platformFee <= 10,            "Fee cannot exceed 10%");

        owner          = msg.sender;
        platformWallet = _platformWallet;
        platformFee    = _platformFee;
    }

    // ── Core Functions ───────────────────────────────────────────

    /**
     * @dev Creates a new Escrow contract for a hired project
     * Called by the frontend when client accepts a proposal
     *
     * @param _freelancer   Freelancer's wallet address
     * @param _projectId    MongoDB project ID
     * @param _deadline     Unix timestamp deadline
     * @return escrowAddress  Address of newly deployed escrow
     */
    function createEscrow(
        address _freelancer,
        string  memory _projectId,
        uint256 _deadline
    )
        external
        returns (address escrowAddress)
    {
        // Prevent duplicate escrow for same project
        require(
            projectEscrows[_projectId] == address(0),
            "Escrow already exists for this project"
        );
        require(_freelancer != address(0), "Invalid freelancer address");
        require(_freelancer != msg.sender, "Client and freelancer must differ");

        // Deploy a new Escrow contract
        // msg.sender becomes the client
        Escrow newEscrow = new Escrow(
            msg.sender,      // client
            _freelancer,
            platformWallet,
            _projectId,
            platformFee,
            _deadline
        );

        escrowAddress = address(newEscrow);

        // Record in mappings
        projectEscrows[_projectId]    = escrowAddress;
        userEscrows[msg.sender].push(escrowAddress);
        userEscrows[_freelancer].push(escrowAddress);
        allEscrows.push(escrowAddress);
        escrowCount++;

        emit EscrowCreated(
            escrowAddress,
            msg.sender,
            _freelancer,
            _projectId,
            block.timestamp
        );

        return escrowAddress;
    }

    // ── View Functions ───────────────────────────────────────────

    /**
     * @dev Get the escrow address for a specific project
     */
    function getProjectEscrow(string memory _projectId)
        external
        view
        returns (address)
    {
        return projectEscrows[_projectId];
    }

    /**
     * @dev Get all escrows for a specific user
     */
    function getUserEscrows(address _user)
        external
        view
        returns (address[] memory)
    {
        return userEscrows[_user];
    }

    /**
     * @dev Get total number of escrows created
     */
    function getEscrowCount() external view returns (uint256) {
        return escrowCount;
    }

    // ── Admin Functions ──────────────────────────────────────────

    /**
     * @dev Update platform fee (max 10%)
     */
    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 10, "Fee cannot exceed 10%");
        platformFee = _newFee;
        emit PlatformFeeUpdated(_newFee);
    }

    /**
     * @dev Update platform wallet address
     */
    function updatePlatformWallet(address _newWallet) external onlyOwner {
        require(_newWallet != address(0), "Invalid address");
        platformWallet = _newWallet;
        emit PlatformWalletUpdated(_newWallet);
    }
}