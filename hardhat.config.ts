import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

let secret = require("./secret");

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.13",
  networks:{
    rinkeby: {
      url: secret.url,
      accounts: [secret.key],
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};

export default config;
