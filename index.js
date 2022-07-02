const { ethers } = require("ethers");
const cronosOracleABI = require("./cronos-oracle-abi.js");
const provider = new ethers.providers.JsonRpcProvider("https://rpc.vvs.finance");

const cronosOracleAddress = "0xb3DF0a9582361db08EC100bd5d8CB70fa8579f4B";

async function getLatestPrice() {
    const oracleContract = new ethers.Contract(cronosOracleAddress, cronosOracleABI, provider);
    /*
    let price = await oracleContract.latestAnswer();
    let humanReadablePrice = ethers.utils.formatUnits(price, 8);
    let timestamp = await oracleContract.latestTimestamp();
    let humanReadableTimestamp = ethers.utils.formatUnits(timestamp, 0);
    let round = await oracleContract.latestRound();
    let humanReadableRound = ethers.utils.formatUnits(round, 8);
    console.log(humanReadablePrice, humanReadableTimestamp, humanReadableRound);
    */

    let latestRoundData = await oracleContract.latestRoundData();
    let price =  ethers.utils.formatUnits(latestRoundData.answer, 8);
    let timestamp = ethers.utils.formatUnits(latestRoundData.updatedAt, 0) * 1000;
    console.log(`[${new Date(timestamp).toLocaleString()}] ${price}`);
}

getLatestPrice();
