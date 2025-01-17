const { expect } = require("chai");
import { ethers } from "hardhat";
const assert = require("assert");

let factory;
let contract;

describe("BLX Token contract", function () {

  beforeEach(async function () {
    factory = await ethers.getContractFactory("BLXToken");
    contract = await factory.deploy("Bloxify Token", "BLX");
  })

  it("initial state should have name as Bloxify Token, symbol as BLX, decimals as 18 and totalSupply as 0", async function () {
    const name = "Bloxify Token";
    const symbol = "BLX";
    const initialSupply = 0;
    const decimals = 18;

    assert.equal(await contract.totalSupply(), initialSupply);
    assert.equal(await contract.name(), name);
    assert.equal(await contract.symbol(), symbol);
    assert.equal(await contract.decimals(), decimals);
  });

  it("balance of token should change accordingly to mint and transfer methods", async function () {
    const [addr1, addr2] = await ethers.getSigners();
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

    // check if you can send 200 while only owning 100
    await contract.mint(100);
    await expect( contract.transfer(addr2.address, 200)).to.be.revertedWith('Not enough funds');

  });

  it("transfer should add and subtract balances correctly for sender and recipient", async function () {
    const [addr1, addr2] = await ethers.getSigners();

    await contract.mint(100);
    await contract.transfer(addr2.address, 30);

    // check if senders balance has decreased
    assert.equal(await contract.balanceOf(addr1.address), 70);

    // check if recipient got his funds
    assert.equal(await contract.balanceOf(addr2.address), 30);
  });

  it("functin should not let you approve more funds than you own", async function () {
    const [addr1, addr2] = await ethers.getSigners();

    // approving funds before minting any
    await expect( contract.approve(addr2.address, 10)).to.be.revertedWith('Not enough funds');

    // approving more funds than on balance
    await contract.mint(100);
    await expect( contract.approve(addr2.address, 200)).to.be.revertedWith('Not enough funds');

  });

  it ("allowance should change properly with new approve calls", async function () {
    const [addr1, addr2, addr3] = await ethers.getSigners();

    await contract.mint(100);
    await contract.approve(addr2.address, 70);
    await contract.approve(addr3.address, 30);

    // check if allowance is added correctyly 
    assert.equal(await contract.allowance(addr1.address, addr2.address), 70);
    assert.equal(await contract.allowance(addr1.address, addr3.address), 30);

    await contract.approve(addr2.address, 90);
    await contract.approve(addr3.address, 5);

    // check if allowance is overridden 
    assert.equal(await contract.allowance(addr1.address, addr2.address), 90);
    assert.equal(await contract.allowance(addr1.address, addr3.address), 5);
  });

  it("transferFrom should allow to send allowed tokens, change balances and allowance amount", async function () {
    const [addr1, addr2, addr3] = await ethers.getSigners();

    // mint and approve funds
    await contract.mint(100);
    await contract.approve(addr2.address, 70);

    // send funds approved by addr1
    await contract.connect(addr2).transferFrom(addr1.address, addr3.address, 50);

    assert.equal(await contract.balanceOf(addr1.address), 50);
    assert.equal(await contract.allowance(addr1.address, addr2.address), 20);
    
  });

  it("transferFrom should not allow to send more than allowed amount", async function () {
    const [addr1, addr2, addr3] = await ethers.getSigners();

    // mint and approve funds
    await contract.mint(100);
    await contract.approve(addr2.address, 70);
    
    // try to send more funds than approved
    await expect(contract.connect(addr2).transferFrom(addr1.address, addr3.address, 80)).to.be.revertedWith('Access to funds restricted');
    
  });
    
});
