const {
  weatherRecordAddress,
  multicall,
  weatherRecordABI,
} = require("./constants");
const {
  getByteCodeByString,
  getStringByByteCode,
  outputTemperatureFromContract,
} = require("./weather-contract-util");

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

getMultipleCityTemperatures([1656757414, 1656757389], ["shenzhen", "shenzhen"]);
