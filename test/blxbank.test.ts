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

  it("depositing funds should change user balance and overall balance in bank", async function () {
    await tokenContract.mint(100);

    // approve bankContract to use funds
    tokenContract.approve(bankContract.address, 80);

    //try to deposit more funds than you own
    await expect(bankContract.deposit(200)).to.be.revertedWith('Not enough funds');
    //try to deposit more funds than allowed
    await expect(bankContract.deposit(90)).to.be.revertedWith('Access to funds restricted');

  });
});
