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


});

