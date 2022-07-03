//load 'ethers' and 'fs'

const { Wallet } = require("ethers");

ethers = require("ethers");
fs = require("fs");
require("../../../app");

const provider = new ethers.providers.JsonRpcProvider(
  "https://cronos-testnet-3.crypto.org:8545/"
);

const privateKey = process.env.PRIVATE_KEY;
const defaultGasPrice = ethers.utils.parseUnits("5000", "gwei");

if (privateKey == undefined) {
  console.log("please run with a private key like this");
  console.log("  PRIVATE_KEY=xxxxx node deploy.js");
  process.exit(1);
}

const wallet = new Wallet(privateKey, provider);

//Read bin and abi file to object; names of the solcjs-generated files renamed
bytecode = fs
  .readFileSync(`${__basedir}/solc_output/Multicall2.bin`)
  .toString();
abi = JSON.parse(
  fs.readFileSync(`${__basedir}/solc_output/Multicall2.abi`).toString()
);

const account = wallet.connect(provider);

const myContract = new ethers.ContractFactory(abi, bytecode, account);

async function main() {
  const contract = await myContract.deploy();

  console.log(contract.address);
  console.log(contract.deployTransaction);
}

main();
