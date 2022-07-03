const {
  getTemperatureWithDecimalByCity,
  impossibleTemperature,
} = require("./weather-source");

const { getByteCodeByString } = require("./weather-contract-util.js");

const {
  privateKey,
  weatherRecordAddress,
  weatherRecordABI,
  multicall,
} = require("./constants");

if (privateKey == undefined) {
  console.log("please run with a private key like this");
  console.log("  PRIVATE_KEY=xxxxx node write-weather.js");
  process.exit(1);
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

reportMultipleCityTemperatures(["shenzhen", "shanghai", "beijing"]);
