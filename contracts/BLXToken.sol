//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// TODO: Implement IERC20.sol interface and make the token mintable
contract BLXToken is IERC20{

    string public name;
    string public symbol;
    uint public decimals;
    uint public override totalSupply;

    mapping(address => uint) public balances;
    mapping(address => mapping(address => uint)) public allowed;
    
    constructor(string memory _name, string  memory _symbol){
        name = _name;
        symbol = _symbol;
        decimals = 18;
        totalSupply = 0;
    }

    event Mint(address minter, uint amount);

    function mint(uint amount) public returns(bool){
        balances[msg.sender] += amount;
        totalSupply += amount;
        emit Mint(msg.sender, amount);
        return true;
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

    function allowance(address owner, address spender) public view override returns(uint){
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
