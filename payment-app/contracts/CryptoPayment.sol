// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CryptoPayment {
    event PaymentSent(
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        string message,
        uint256 timestamp
    );

    function sendPayment(
        address payable recipient,
        string memory message
    ) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(recipient != msg.sender, "Cannot send to yourself");
        recipient.transfer(msg.value);
        emit PaymentSent(
            msg.sender,
            recipient,
            msg.value,
            message,
            block.timestamp
        );
    }
}