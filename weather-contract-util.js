const { ethers } = require("ethers");
const { temperatureDecimal } = require("./weather-source");

const signBit = 0x10000; // used for check negative numbers on smart contract

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

function outputTemperatureFromContract(batchId, cityName, temperature) {
  console.log(
    `get temperature ${parseTemperatureFromContract(
      temperature
    )} of ${cityName} from contract by batch id ${batchId}`
  );
}

module.exports = {
  parseTemperatureFromContract: parseTemperatureFromContract,
  encodeTemperatureWithSignBit: encodeTemperatureWithSignBit,
  getByteCodeByString: getByteCodeByString,
  getStringByByteCode: getStringByByteCode,
  outputTemperatureFromContract: outputTemperatureFromContract,
  signBit: signBit,
};
