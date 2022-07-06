const {
  getTemperatureWithDecimalByCity,
  impossibleTemperature,
} = require("./weather-source");
const {
  privateKey,
  defaultGasPrice,
  provider,
  weatherRecordContract,
  wallet,
} = require("./constants");

const {
  getByteCodeByString,
  encodeTemperatureBySignBit,
  outputTemperatureFromContract,
} = require("./weather-contract-util");

if (privateKey == undefined) {
  console.log("please run with a private key like this");
  console.log("  PRIVATE_KEY=xxxxx node write-weather.js");
  process.exit(1);
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

async function reportWeatherRecord(batchId, cityName, temperatureWithDecimal) {
  let cityNameByteCode = getByteCodeByString(cityName);
  const unsignedTx =
    await weatherRecordContract.populateTransaction.reportWeather(
      batchId,
      cityNameByteCode,
      encodeTemperatureBySignBit(temperatureWithDecimal)
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

async function getWeatherRecord(batchId, cityName) {
  let cityNameByteCode = getByteCodeByString(cityName);
  let record = await weatherRecordContract.getWeather(
    batchId,
    cityNameByteCode
  );
  outputTemperatureFromContract(batchId, cityName, record);
}

reportSingleCityTemperature("shenzhen");
