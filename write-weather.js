const { Wallet, ethers } = require("ethers");
const weatherRecordABI = require("./weather-record-abi.js");
const provider = new ethers.providers.JsonRpcProvider(
  "https://cronos-testnet-3.crypto.org:8545/"
);
const axios = require("axios");
const { get } = require("http");

const privateKey = process.env.PRIVATE_KEY;
const weatherRecordAddress = "0x49354813d8BFCa86f778DfF4120ad80E4D96D74E";
const temperatureDecimal = 2;
const defaultGasPrice = ethers.utils.parseUnits("5000", "gwei");
const impossibleTemperature = 1000;
const signBit = 0x10000; // used for check negative numbers on smart contract

if (privateKey == undefined) {
  console.log("please run with a private key like this");
  console.log("  PRIVATE_KEY=xxxxx node write-weather.js");
  process.exit(1);
}

let wallet = new Wallet(privateKey, provider);

const weatherRecordContract = new ethers.Contract(
  weatherRecordAddress,
  weatherRecordABI,
  provider
);

async function getWeatherRecord(batchId, cityName) {
  let cityNameByteCode = getByteCodeByString(cityName);
  let record = await weatherRecordContract.getWeather(
    batchId,
    cityNameByteCode
  );
  console.log(
    `get temperature ${parseTemperatureFromContract(
      record
    )} of ${cityName} from contract by batch id ${batchId}`
  );
}

async function reportWeatherRecord(batchId, cityName, temperatureWithDecimal) {
  let cityNameByteCode = getByteCodeByString(cityName);
  const unsignedTx =
    await weatherRecordContract.populateTransaction.reportWeather(
      batchId,
      cityNameByteCode,
      encodeTemperatureWithSignBit(temperatureWithDecimal)
    );
  let estimatedGas = await provider.estimateGas(unsignedTx);
  unsignedTx.gasLimit = estimatedGas;
  unsignedTx.gasPrice = defaultGasPrice;
  unsignedTx.nonce = await provider.getTransactionCount(wallet.address);
  const signedTx = await wallet.signTransaction(unsignedTx);
  const tx = await provider.sendTransaction(signedTx);
  await provider.waitForTransaction(tx.hash);
  console.log("confirmed tx id:", tx.hash);
}

async function getTemperatureByCity(cityName) {
  const url = `https://goweather.herokuapp.com/weather/${cityName}`;
  try {
    const { data } = await axios.get(url);
    if (!data.hasOwnProperty("temperature")) {
      return impossibleTemperature;
    }
    return parseTemperature(data.temperature);
  } catch (error) {
    console.log(error);
    return impossibleTemperature;
  }
}

async function getTemperatureWithDecimalByCity(cityName) {
  let temperature = await getTemperatureByCity(cityName);
  if (temperature != impossibleTemperature) {
    return temperature * 10 ** temperatureDecimal;
  }
  return impossibleTemperature;
}

// +27.2 °C
// -27.2 °C
function parseTemperature(temperatureStr) {
  return parseFloat(temperatureStr) || impossibleTemperature;
}

function parseTemperatureFromContract(temperature) {
  let exactTemperature = temperature;
  let signFlag = "+";
  if (temperature & signBit) {
    signFlag = "-";
    exactTemperature = temperature & ~signBit;
  }
  return `${signFlag}${exactTemperature / 10 ** temperatureDecimal} °C`;
}

function encodeTemperatureWithSignBit(temperature) {
  if (temperature < 0) return -temperature | signBit;
  return temperature;
}

function getByteCodeByString(str) {
  return ethers.utils.formatBytes32String(str);
}

function getStringByByteCode(byteCode) {
  return ethers.utils.parseBytes32String(byteCode);
}

async function reportSingleCityTemperature(cityName) {
  const secondsSinceEpoch = Math.round(Date.now() / 1000);
  let batchId = secondsSinceEpoch;

  let temperatureWithDecimal = await getTemperatureWithDecimalByCity(cityName);
  if (temperatureWithDecimal == impossibleTemperature) {
    console.log("wrong temperature data");
    return;
  }
  console.log(`report temperature ${temperatureWithDecimal} of ${cityName}`);
  await reportWeatherRecord(batchId, cityName, temperatureWithDecimal);
  await getWeatherRecord(batchId, cityName);
}

reportSingleCityTemperature("shenzhen");
