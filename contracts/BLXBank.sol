//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BLXBank is Ownable, Pausable{
    
    uint public bankBalance;
    address public tokenAddress;

    constructor(address _tokenAddress){
        tokenAddress = _tokenAddress;
    }

    struct BankAccount {
        uint256 createdAt;
        uint256 balance;
        uint256 transactionsCount;
        bool isActive;
    }

    mapping(address => BankAccount) private userAccount;

    modifier active(){
        require(userAccount[msg.sender].isActive == true, "You have to be an active user");
        _;
    }

    function accountInformation(address user) public view returns(uint, uint, uint, bool){
        require(msg.sender == user, "You are not the owner");
        return(userAccount[msg.sender].createdAt, userAccount[msg.sender].balance, userAccount[msg.sender].transactionsCount, userAccount[msg.sender].isActive);
    }
    
    function deposit(uint amount) public {
        require(IERC20(tokenAddress).balanceOf(msg.sender) >= amount, "Not enough funds");
        require(IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount), "Contract not approved as spender");

        bankBalance+=amount;
        if(userAccount[msg.sender].createdAt == 0){
            userAccount[msg.sender].createdAt = block.timestamp;
            userAccount[msg.sender].isActive = true;
        }

        userAccount[msg.sender].transactionsCount += 1;
        userAccount[msg.sender].balance += amount;
    }

    function withdraw(uint amount) public active{
        require(userAccount[msg.sender].balance >= amount, "Not enough funds");
        bankBalance-=amount;
        userAccount[msg.sender].balance -= amount;
        require(IERC20(tokenAddress).transfer(msg.sender, amount), "Transfer failed");
    }

    function deactivate() public active{
        require(userAccount[msg.sender].balance == 0, "Withdraw your funds before deactivation");
        userAccount[msg.sender].isActive = false;
        userAccount[msg.sender].createdAt = 0;
        userAccount[msg.sender].transactionsCount = 0;
    }

}
