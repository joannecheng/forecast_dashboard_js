"use strict";
// requires underscore

let ForecastDashboard;
if (typeof ForecastDashboard == "undefined") {
  ForecastDashboard = {}
}

class CalculateQuartiles {
  constructor(data) {
    this.data = data;
  }

  result() {
    let timestamps = [];
    _.each(this.data, function(modelData, modelName) {
      timestamps = _.union(
          timestamps,
          _.map(modelData.data, function(d) { return d[0] })
      );
      return timestamps;
    });

    let dataByTimestamp = {}
    _.each(timestamps, function(timestamp) {
      dataByTimestamp[timestamp] = [];
    });

    _.each(this.data, function(modelData, modelName) {
      _.each(modelData.data, function(dataPoint) {
        dataByTimestamp[dataPoint[0]].push(parseFloat(dataPoint[1]));
      });
    });

    return this._quartiles(dataByTimestamp);
  }

  _quartiles(dataByTimestamp) {
    let compressedDataByTimestamp = _.reject(dataByTimestamp, function(data) {
      return data.length <= 3;
    })
    return _.map(compressedDataByTimestamp, (data, timestamp) => {
      return {
        timestamp: parseInt(timestamp),
        mean: this._mean(data),
        quarterLow: this._quarterLow(data),
        quarterHigh: this._quarterHigh(data),
        max: _.max(data),
        min: _.min(data)
      }
    });
  }

  _quarterLow(data) {
    return (_.max(data) - _.min(data)) * 0.25 + _.min(data);
  }

  _quarterHigh(data) {
    return (_.max(data) - _.min(data)) * 0.75 + _.min(data);
  }

  _mean(data) {
    return _.reduce(data, function(memo, num) { return memo + num; }, 0)/data.length;
  }
}

ForecastDashboard.CalculateQuartiles = CalculateQuartiles;
