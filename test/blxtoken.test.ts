const { expect } = require("chai");
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

  it("initialSupply should increase with every new mint and not change with transfer", async function () {
    const [addr1, addr2] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("BLXToken");
    const contract = await factory.deploy("Bloxify Token", "BLX");

    // check totalSupply before minting
    assert.equal(await contract.totalSupply(), 0);

    // mint 100 and check if amount increased
    await contract.mint(100);
    assert.equal(await contract.totalSupply(), 100);

    // mint 100 using different address
    await contract.connect(addr2).mint(100);

    assert.equal(await contract.totalSupply(), 200);

    // make a transfer and see if totalSupply has changed
    await contract.transfer(addr2.address, 50);
    assert.equal(await contract.totalSupply(), 200);

  });

  it("transfer should not work if you don't have enough funds", async function () {
    const [addr1, addr2] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("BLXToken");
    const contract = await factory.deploy("Bloxify Token", "BLX");

    // check if you can send 200 while only owning 100
    await contract.mint(100);
    await expect( contract.transfer(addr2.address, 200)).to.be.revertedWith('Not enough funds');

  });

  it("transfer should add and subtract balances correctly for sender and recipient", async function () {
    const [addr1, addr2] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("BLXToken");
    const contract = await factory.deploy("Bloxify Token", "BLX");

    await contract.mint(100);
    await contract.transfer(addr2.address, 30);

    // check if senders balance has decreased
    assert.equal(await contract.balanceOf(addr1.address), 70);

    // check if recipient got his funds
    assert.equal(await contract.balanceOf(addr2.address), 30);
  });

  it("functin should not let you approve more funds than you own", async function () {
    const [addr1, addr2] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("BLXToken");
    const contract = await factory.deploy("Bloxify Token", "BLX");

    // approving funds before minting any
    await expect( contract.approve(addr2.address, 10)).to.be.revertedWith('Not enough funds');

    // approving more funds than on balance
    await contract.mint(100);
    await expect( contract.approve(addr2.address, 200)).to.be.revertedWith('Not enough funds');

  });

});
