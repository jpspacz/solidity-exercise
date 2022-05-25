import { ethers } from "hardhat";
import { expect } from "chai";
const assert = require("assert");

let tokenFactory;
let tokenContract;
let tokenAddress;
let bankFactory;
let bankContract;

describe("BLX Bank contract", function () {
  beforeEach(async function () {
    tokenFactory = await ethers.getContractFactory("BLXToken");
    tokenContract = await tokenFactory.deploy("Bloxify Token", "BLX");

    tokenAddress = tokenContract.address;

    bankFactory = await ethers.getContractFactory("BLXBank");
    bankContract = await bankFactory.deploy(tokenAddress);
  })

  it("depositing funds should change user balance and overall balance in bank", async function () {
    const [addr1] = await ethers.getSigners();
    await tokenContract.mint(100);

    // approve bankContract to use funds and deposit funds
    tokenContract.approve(bankContract.address, 100);
    await bankContract.deposit(80);

    // check if overall balance changes
    assert.equal(await bankContract.bankBalance(), 80);

    // check if user balance changed
    const [, balance, , ] = await bankContract.accountInformation(addr1.address) ;
    assert.equal(balance.toNumber(), 80 );
  });

  it("can't deposit more funds than you own or are allowed to", async function () {
    await tokenContract.mint(100);

    // approve bankContract to use funds
    tokenContract.approve(bankContract.address, 80);

    //try to deposit more funds than you own
    await expect(bankContract.deposit(200)).to.be.revertedWith('Not enough funds');
    //try to deposit more funds than allowed
    await expect(bankContract.deposit(90)).to.be.revertedWith('Access to funds restricted');
  });

  it("withdrawing funds should change user balance and overall balance in bank", async function () {
    const [addr1] = await ethers.getSigners();
    // deposit funds
    await tokenContract.mint(100);
    tokenContract.approve(bankContract.address, 100);
    await bankContract.deposit(100)
  
    await bankContract.withdraw(30);

    //check if overall balance changes
    assert.equal(await bankContract.bankBalance(), 70);

    //check if user balance changes
    const [,balance,,] = await bankContract.accountInformation(addr1.address);
    assert.equal(balance.toNumber(), 70);
  });

  it("can't withdraw more than you own", async function () {
    // deposit funds
    await tokenContract.mint(100);
    await tokenContract.approve(bankContract.address, 100);
    await bankContract.deposit(100)
    
    // withdraw more than you own
    await expect(bankContract.withdraw(200)).to.be.revertedWith('Not enough funds');

  });

  it("user before creation is inactive and changes after creation", async function () {
    const [addr1] = await ethers.getSigners();

    // check user before creation
    const[creationTime, balance, txNum, active] = await bankContract.accountInformation(addr1.address);
    assert.equal(creationTime.toNumber(), 0);
    assert.equal(balance.toNumber(), 0);
    assert.equal(txNum.toNumber(), 0);
    assert.equal(active, false);

    // deposit funds - create user
    await tokenContract.mint(100);
    await tokenContract.approve(bankContract.address, 100);
    await bankContract.deposit(100)
  
    // check user after creation
    const[creationTimeAfter, balanceAfter, txNumAfter, activeAfter] = await bankContract.accountInformation(addr1.address);
    assert.notEqual(creationTimeAfter.toNumber(), 0);
    assert.equal(balanceAfter.toNumber(), 100);
    assert.equal(txNumAfter.toNumber(), 1);
    assert.equal(activeAfter, true);

  });

  it("check global bank amount", async function () {
    const [addr1, addr2] = await ethers.getSigners();

    // check bank balance before any deposits
    assert.equal(await bankContract.bankBalance(), 0);

    // deposit funds user 1
    await tokenContract.mint(100);
    await tokenContract.approve(bankContract.address, 100);
    await bankContract.deposit(100)

    // deposit funds user 2
    await tokenContract.connect(addr2).mint(50);
    await tokenContract.connect(addr2).approve(bankContract.address, 50);
    await bankContract.connect(addr2).deposit(50)
    
    // check bank balance after two seperate deposits
    assert.equal(await bankContract.bankBalance(), 150);

    // withdraw from account
    await bankContract.connect(addr2).withdraw(20);

    // check if balance changes after withdrawl
    assert.equal(await bankContract.bankBalance(), 130);
  });

  it("check owner", async function () {
    assert.notEqual(await bankContract.owner(), "0x0000000000000000000000000000000000000000");
  });

  it("check if you can deactivate account with funds in it", async function () {
    // activate account
    await tokenContract.mint(100);
    await tokenContract.approve(bankContract.address, 100);
    await bankContract.deposit(100)

    // check if you can deactivate with funds
    await expect(bankContract.deactivate()).to.be.revertedWith('Withdraw your funds before deactivation');
  });

  it("check if deactivation resets account data", async function () {
    // activate account
    const [addr1] = await ethers.getSigners();
    await tokenContract.mint(100);
    await tokenContract.approve(bankContract.address, 100);
    await bankContract.deposit(100)

    // deactivate account
    await bankContract.withdraw(100);
    await bankContract.deactivate();

    // check if data is reset to default
    const[creationTime, balance, txNum, active] = await bankContract.accountInformation(addr1.address);
    assert.equal(creationTime.toNumber(), 0);
    assert.equal(balance.toNumber(), 0);
    assert.equal(txNum.toNumber(), 0);
    assert.equal(active, false);
  });

});

