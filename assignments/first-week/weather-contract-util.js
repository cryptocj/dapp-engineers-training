const { ethers } = require("ethers");
const {
  temperatureDecimal,
  impossibleTemperature,
} = require("./weather-source");

const signBit = 0x10000; // used for check negative numbers on smart contract

function decodeTemperatureFromContract(temperature) {
  if (temperature == impossibleTemperature * 10 ** temperatureDecimal) {
    return "impossible";
  }
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
    `get temperature ${decodeTemperatureFromContract(
      temperature
    )} of ${cityName} from contract by batch id ${batchId}`
  );
}

module.exports = {
  decodeTemperatureFromContract: decodeTemperatureFromContract,
  encodeTemperatureWithSignBit: encodeTemperatureWithSignBit,
  getByteCodeByString: getByteCodeByString,
  getStringByByteCode: getStringByByteCode,
  outputTemperatureFromContract: outputTemperatureFromContract,
  signBit: signBit,
};
