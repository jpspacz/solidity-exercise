//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// TODO: Implement IERC20.sol interface and make the token mintable
contract BLXToken is IERC20{

    string public name;
    string public symbol;
    uint256 public decimals;
    uint public override totalSupply;

    mapping(address => uint) public balances;
    mapping(address => mapping(address => uint)) public allowed;
    
    constructor(){
        name = "Bloxify Token";
        symbol = "BLX";
        decimals = 18;
        totalSupply = 0;
    }

    function mint(uint amount) public {
        balances[msg.sender] += amount;
        totalSupply += amount;
    }

    function balanceOf(address user) public view returns (uint){
        return balances[user];
    }

    function transfer(address to, uint amount) public override returns(bool){
        require(balances[msg.sender] >= amount, "Not enough funds");
        
        balances[msg.sender] -= amount;
        balances[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function allowance(address owner, address spender) public view override returns(uint256){
        return allowed[owner][spender];
    }

    function approve(address spender, uint amount) public override returns (bool){
        require(balances[msg.sender] >= amount, "Not enough funds");
        require(amount > 0, "Negative amount not allowed");

        allowed[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);

        return true;
    }

    function transferFrom(address from, address to, uint amount) public override returns (bool){
        require(allowed[from][msg.sender] >= amount, "Access to funds restricted");
        require(balances[from] >= amount, "Not enough funds");

        balances[from] -= amount;
        allowed[from][msg.sender] -= amount;
        balances[to] += amount;

        emit Transfer(from, to, amount);
        return true;
    }   

}
