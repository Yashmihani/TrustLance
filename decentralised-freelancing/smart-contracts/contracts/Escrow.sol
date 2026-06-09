// contracts/Escrow.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// ReentrancyGuard prevents reentrancy attacks
// (a hacker calling withdraw multiple times before balance updates)
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Escrow
 * @dev Holds MATIC for a single project between client and freelancer
 *
 * Lifecycle:
 *   AWAITING_PAYMENT → FUNDED → COMPLETE / REFUNDED / DISPUTED
 */
contract Escrow is ReentrancyGuard {

    // ── State variables ──────────────────────────────────────────

    address public client;        // who created this escrow
    address public freelancer;    // who will receive payment
    address public platform;      // platform wallet (takes small fee)
    uint256 public amount;        // total locked amount in wei
    uint256 public platformFee;   // fee percentage (e.g. 5 = 5%)
    string  public projectId;     // off-chain MongoDB project ID
    uint256 public createdAt;     // timestamp of creation
    uint256 public deadline;      // project deadline timestamp

    // ── Escrow status enum ───────────────────────────────────────

    enum Status {
        AWAITING_PAYMENT,  // 0 — created but not funded yet
        FUNDED,            // 1 — client deposited MATIC
        COMPLETE,          // 2 — payment released to freelancer
        REFUNDED,          // 3 — funds returned to client
        DISPUTED           // 4 — dispute raised, platform decides
    }

    Status public status;

    // ── Events ───────────────────────────────────────────────────
    // Events are emitted on every state change
    // Frontend listens to these for real-time updates

    event PaymentDeposited(
        address indexed client,
        uint256 amount,
        uint256 timestamp
    );

    event PaymentReleased(
        address indexed freelancer,
        uint256 amount,
        uint256 platformFeeAmount,
        uint256 timestamp
    );

    event PaymentRefunded(
        address indexed client,
        uint256 amount,
        uint256 timestamp
    );

    event DisputeRaised(
        address indexed raisedBy,
        uint256 timestamp
    );

    event DisputeResolved(
        address indexed resolvedBy,
        address indexed winner,
        uint256 amount,
        uint256 timestamp
    );

    // ── Modifiers ────────────────────────────────────────────────
    // Modifiers are reusable require checks

    /// Only the client can call this
    modifier onlyClient() {
        require(msg.sender == client, "Only client can call this");
        _;
    }

    /// Only the freelancer can call this
    modifier onlyFreelancer() {
        require(msg.sender == freelancer, "Only freelancer can call this");
        _;
    }

    /// Only the platform wallet can call this
    modifier onlyPlatform() {
        require(msg.sender == platform, "Only platform can call this");
        _;
    }

    /// Either client or freelancer
    modifier onlyParties() {
        require(
            msg.sender == client || msg.sender == freelancer,
            "Only project parties can call this"
        );
        _;
    }

    /// Escrow must be in a specific status
    modifier inStatus(Status _status) {
        require(status == _status, "Invalid escrow status for this action");
        _;
    }

    // ── Constructor ──────────────────────────────────────────────

    /**
     * @dev Called by EscrowFactory when a freelancer is hired
     * @param _client       Address of the client
     * @param _freelancer   Address of the freelancer
     * @param _platform     Platform wallet for fee collection
     * @param _projectId    MongoDB project ID (off-chain reference)
     * @param _platformFee  Fee percentage (1-10)
     * @param _deadline     Unix timestamp for project deadline
     */
    constructor(
        address _client,
        address _freelancer,
        address _platform,
        string  memory _projectId,
        uint256 _platformFee,
        uint256 _deadline
    ) {
        // Validate inputs
        require(_client     != address(0), "Invalid client address");
        require(_freelancer != address(0), "Invalid freelancer address");
        require(_platform   != address(0), "Invalid platform address");
        require(_client     != _freelancer, "Client and freelancer must differ");
        require(_platformFee <= 10, "Fee cannot exceed 10%");

        client      = _client;
        freelancer  = _freelancer;
        platform    = _platform;
        projectId   = _projectId;
        platformFee = _platformFee;
        deadline    = _deadline;
        createdAt   = block.timestamp;
        status      = Status.AWAITING_PAYMENT;
    }

    // ── Core Functions ───────────────────────────────────────────

    /**
     * @dev Client deposits MATIC to fund the escrow
     * Must send exactly the agreed amount
     * Status changes: AWAITING_PAYMENT → FUNDED
     */
    function deposit()
        external
        payable
        onlyClient
        inStatus(Status.AWAITING_PAYMENT)
    {
        require(msg.value > 0, "Must deposit more than 0 MATIC");

        amount = msg.value;
        status = Status.FUNDED;

        emit PaymentDeposited(client, amount, block.timestamp);
    }

    /**
     * @dev Client approves completed work — releases payment to freelancer
     * Platform fee is deducted before sending to freelancer
     * Status changes: FUNDED → COMPLETE
     *
     * nonReentrant prevents reentrancy attacks:
     * Without it, a malicious freelancer contract could call
     * releasePayment again before the first call finishes
     */
    function releasePayment()
        external
        onlyClient
        inStatus(Status.FUNDED)
        nonReentrant
    {
        status = Status.COMPLETE;  // update state BEFORE sending funds

        // Calculate platform fee
        uint256 feeAmount      = (amount * platformFee) / 100;
        uint256 freelancerAmount = amount - feeAmount;

        // Send fee to platform
        if (feeAmount > 0) {
            (bool feeSent, ) = payable(platform).call{value: feeAmount}("");
            require(feeSent, "Platform fee transfer failed");
        }

        // Send remaining amount to freelancer
        (bool sent, ) = payable(freelancer).call{value: freelancerAmount}("");
        require(sent, "Payment to freelancer failed");

        emit PaymentReleased(
            freelancer,
            freelancerAmount,
            feeAmount,
            block.timestamp
        );
    }

    /**
     * @dev Refund client if work is not delivered
     * Only possible when escrow is FUNDED (not yet released)
     * Status changes: FUNDED → REFUNDED
     */
    function refundClient()
        external
        onlyClient
        inStatus(Status.FUNDED)
        nonReentrant
    {
        status = Status.REFUNDED;  // update state BEFORE sending funds

        (bool sent, ) = payable(client).call{value: amount}("");
        require(sent, "Refund to client failed");

        emit PaymentRefunded(client, amount, block.timestamp);
    }

    /**
     * @dev Either party can raise a dispute
     * Freezes the funds until platform resolves it
     * Status changes: FUNDED → DISPUTED
     */
    function disputeProject()
        external
        onlyParties
        inStatus(Status.FUNDED)
    {
        status = Status.DISPUTED;

        emit DisputeRaised(msg.sender, block.timestamp);
    }

    /**
     * @dev Platform resolves a dispute — sends funds to winner
     * Only platform wallet can call this
     * @param _winner  Address of who wins (client or freelancer)
     */
    function resolveDispute(address _winner)
        external
        onlyPlatform
        inStatus(Status.DISPUTED)
        nonReentrant
    {
        require(
            _winner == client || _winner == freelancer,
            "Winner must be client or freelancer"
        );

        // Determine final status
        status = (_winner == client) ? Status.REFUNDED : Status.COMPLETE;

        (bool sent, ) = payable(_winner).call{value: amount}("");
        require(sent, "Dispute resolution transfer failed");

        emit DisputeResolved(msg.sender, _winner, amount, block.timestamp);
    }

    // ── View Functions ───────────────────────────────────────────

    /**
     * @dev Returns all escrow details in one call
     * Reduces the number of RPC calls from the frontend
     */
    function getDetails()
        external
        view
        returns (
            address _client,
            address _freelancer,
            uint256 _amount,
            Status  _status,
            string  memory _projectId,
            uint256 _createdAt,
            uint256 _deadline
        )
    {
        return (
            client,
            freelancer,
            amount,
            status,
            projectId,
            createdAt,
            deadline
        );
    }

    /**
     * @dev Returns contract's current MATIC balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}