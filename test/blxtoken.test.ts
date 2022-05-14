import { ethers } from "hardhat";
const assert = require("assert");

describe("BLX Token contract", function () {

  it("initial state should have name as Bloxify Token, symbol as BLX, decimals as 18 and totalSupply as 0", async function () {
    const name = "Bloxify Token";
    const symbol = "BLX";
    const initialSupply = 0;
    const decimals = 18;

    const factory = await ethers.getContractFactory("BLXToken");
    const contract = await factory.deploy(name, symbol);

    assert.equal(await contract.totalSupply(), initialSupply);
    assert.equal(await contract.name(), name);
    assert.equal(await contract.symbol(), symbol);
    assert.equal(await contract.decimals(), decimals);
  });

  it("balance of token should change accordingly to mint and transfer methods", async function () {
    const [addr1, addr2] = await ethers.getSigners();

    const factory = await ethers.getContractFactory("BLXToken");
    const contract = await factory.deploy("Bloxify Token", "BLX");
    const tokenAmount = 100;

    // initial balance should be 0
    assert.equal(await contract.balanceOf(addr1.address), 0);
    
    // raise initial balance by minting new coins
    contract.mint(tokenAmount);

    // check if balance changed
    assert.equal(await contract.balanceOf(addr1.address), tokenAmount);

    // send coins to decrease balance
    contract.transfer(addr2.address, tokenAmount);

    // balance should revert to 0
    assert.equal(await contract.balanceOf(addr1.address), 0);

    // balance of addr2 should increse by sent amount
    assert.equal(await contract.balanceOf(addr2.address), tokenAmount);

  });

});
