// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract dema_Escrow_V1 {
    struct Order {
        uint128 amount; // Price (in smallest token unit) divided by 100
        uint16 requestId; // Number of Orders
        bytes16 requestHash; // 128-bit hash to uniquely identify an order
        uint32 userId; // User ID
    }

    address public owner;
    mapping(address => Order[]) public userOrders; // Stores orders by user's address

    event OrderPlaced(
        address indexed user,
        uint128 amount,
        uint16 requestId,
        string  requestHash,
        uint32 userId,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender; // Initialize contract owner
    }

    /// @notice Places an order with specified parameters.
    /// @param amount The price of the order in smallest unit, divided by 100.
    /// @param requestId A uint16 identifier for the request.
    /// @param requestHash A 128-bit hash of the request.
    /// @param userId The user identifier (uint32).
    function place_Order(
        uint128 amount,
        uint16 requestId,
        string memory requestHash,
        uint32 userId
    ) external payable {
        Order memory newOrder = Order({
            amount: amount,
            requestId: requestId,
            requestHash: generateHash(requestHash),
            userId: userId
        });

        userOrders[msg.sender].push(newOrder);

        emit OrderPlaced(
            msg.sender,
            amount,
            requestId,
            requestHash,
            userId,
            block.timestamp
        );
    }

    /// @notice Allows the owner to withdraw funds from the contract.
    function withdrawFunds() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function generateHash(string memory input) public view returns (bytes16) {
        // Generate the keccak256 hash and cast to bytes16 (first 16 bytes only)
        bytes16 hash = bytes16(keccak256(abi.encodePacked(input)));

        // This hash can be used with other state-reading functions
        return hash;
    }

    /// @notice Get all orders placed by a specific user.
    function getUserOrders(address user)
        external
        view
        returns (Order[] memory)
    {
        return userOrders[user];
    }
}
