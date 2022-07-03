const { Wallet, ethers } = require("ethers");
const weatherRecordABI = require("./weather-record-abi.js");
const {
  getTemperatureWithDecimalByCity,
  impossibleTemperature,
  temperatureDecimal,
} = require("./weather-source");

const provider = new ethers.providers.JsonRpcProvider(
  "https://cronos-testnet-3.crypto.org:8545/"
);

const { Multicall } = require("ethereum-multicall");

const privateKey = process.env.PRIVATE_KEY;
const weatherRecordAddress = "0x49354813d8BFCa86f778DfF4120ad80E4D96D74E";
const multicallAddress = "0xd2e17686dD5642318e182179081854C7eB32fB56";
const defaultGasPrice = ethers.utils.parseUnits("5000", "gwei");
const signBit = 0x10000; // used for check negative numbers on smart contract

const multicall = new Multicall({
  multicallCustomContractAddress: multicallAddress,
  ethersProvider: provider,
  tryAggregate: true,
});

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
  outputTemperatureFromContract(batchId, cityName, record);
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

async function reportMultipleCityTemperatures(cityNameList) {
  const secondsSinceEpoch = Math.round(Date.now() / 1000);
  let batchId = secondsSinceEpoch;

  let contractCallContext = {
    reference: `WeatherRecord`,
    contractAddress: weatherRecordAddress,
    abi: weatherRecordABI,
  };

  let calls = [];
  for (let i = 0; i < cityNameList.length; i++) {
    let cityName = cityNameList[i];
    let temperatureWithDecimal = await getTemperatureWithDecimalByCity(
      cityName
    );
    if (temperatureWithDecimal == impossibleTemperature) {
      console.log(`wrong temperature data of ${cityName}`);
      continue;
    }

    let call = {
      reference: "reportWeatherCall",
      methodName: "reportWeather",
      methodParameters: [
        batchId,
        getByteCodeByString(cityName),
        temperatureWithDecimal,
      ],
    };
    calls.push(call);
    console.log(call);
  }

  contractCallContext.calls = calls;

  const { results, blockNumber } = await multicall.call(contractCallContext);
  console.log(results.WeatherRecord.callsReturnContext);
}

async function getMultipleCityTemperatures(batchIdList, cityNameList) {
  if (batchIdList.length != cityNameList.length) {
    console.log("list parameters length is not equal");
    return;
  }
  let contractCallContext = {
    reference: `WeatherRecord`,
    contractAddress: weatherRecordAddress,
    abi: weatherRecordABI,
  };

  let calls = [];
  for (let i = 0; i < cityNameList.length; i++) {
    let cityName = cityNameList[i];
    let call = {
      reference: "getWeatherCall",
      methodName: "getWeather",
      methodParameters: [batchIdList[i], getByteCodeByString(cityName)],
    };
    calls.push(call);
  }

  contractCallContext.calls = calls;

  const { results, blockNumber } = await multicall.call(contractCallContext);
  for (let i = 0; i < results.WeatherRecord.callsReturnContext.length; i++) {
    let result = results.WeatherRecord.callsReturnContext[i];
    let temperature = result.returnValues[0];
    let batchId = result.methodParameters[0];
    let cityName = getStringByByteCode(result.methodParameters[1]);
    outputTemperatureFromContract(batchId, cityName, temperature);
  }
}

reportSingleCityTemperature("shenzhen");
// reportMultipleCityTemperatures(["shenzhen", "shanghai", "beijing"]);
// getMultipleCityTemperatures([1656757414, 1656757389], ["shenzhen", "shenzhen"]);
