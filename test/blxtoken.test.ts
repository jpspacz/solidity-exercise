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

});
