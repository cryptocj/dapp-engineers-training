const { Multicall } = require("ethereum-multicall");
const { ethers, Wallet } = require("ethers");

const privateKey = process.env.PRIVATE_KEY;
const weatherRecordAddress = "0x49354813d8BFCa86f778DfF4120ad80E4D96D74E";
const multicallAddress = "0xd2e17686dD5642318e182179081854C7eB32fB56";
const defaultGasPrice = ethers.utils.parseUnits("5000", "gwei");
const provider = new ethers.providers.JsonRpcProvider(
  "https://cronos-testnet-3.crypto.org:8545/"
);
const weatherRecordABI = require("./weather-record-abi.js");
const weatherRecordContract = new ethers.Contract(
  weatherRecordAddress,
  weatherRecordABI,
  provider
);
const multicall = new Multicall({
  multicallCustomContractAddress: multicallAddress,
  ethersProvider: provider,
  tryAggregate: true,
});

const wallet = NaN;
if (privateKey) {
  wallet = new Wallet(privateKey, provider);
}

module.exports = {
  privateKey: privateKey,
  weatherRecordAddress: weatherRecordAddress,
  multicallAddress: multicallAddress,
  defaultGasPrice: defaultGasPrice,
  provider: provider,
  weatherRecordContract: weatherRecordContract,
  wallet: wallet,
  multicall: multicall,
  weatherRecordABI: weatherRecordABI,
};
