"use strict";
// requires underscore

let ForecastDashboard;
if (typeof ForecastDashboard == "undefined") {
  ForecastDashboard = {}
}

class QuartileGraph {
  constructor(height, width, data, container) {
    this.yMin = null;
    this.margin = {
      top: 20,
      left: 30,
      right: 20,
      bottom: 25
    }
    this.width = width;
    this.height = height;
    this.data = data;
    this.svg = container.append("g").classed("main-graph-area", true);
    this.svg
      .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
  }

  draw() {
    const areaGenerator = this._areaGenerator();
    const lineGenerator = this._lineGenerator();

    this.svg
      .append("path")
      .attr("d", areaGenerator(_.map(this.data, function(d) {
        return [d.timestamp, d.min, d.max];
      })))
      .classed("range-graph-area", true);

    this.svg
      .append("path")
      .attr("d", areaGenerator(_.map(this.data, function(d) {
        return [d.timestamp, d.quarterLow, d.quarterHigh]; 
      })))
      .classed("middle-graph-area", true);

   this.svg
      .append("path")
      .attr("d", lineGenerator(_.map(this.data, function(d) { return [d.timestamp, d.mean]; })))
      .classed("quartile-graph-line", true);

    this._drawAxis();
  }

  setYMin(yMin) {
    this.yMin = yMin;
  }

  _drawAxis() {
    const xAxis = d3.svg.axis()
      .scale(this._xScale())
      .orient("bottom");
    const yAxis = d3.svg.axis()
      .scale(this._yScale())
      .orient("left");

    this.svg
      .append("g")
      .classed("x-axis-container", true)
      .call(xAxis)
      .classed("axis", true)
      .attr("transform", `translate(0,${this.height - this.margin.top - this.margin.bottom})`);

    this.svg
      .append("g")
      .call(yAxis)
      .classed("axis", true)
  }

  _lineGenerator() {
    const xScale = this._xScale();
    const yScale = this._yScale();
    return d3.svg.line()
      .x(function(d) { return xScale(d[0]); })
      .y(function(d) { return yScale(d[1]); })
      .interpolate("cardinal");
  }

  _areaGenerator() {
    const xScale = this._xScale();
    const yScale = this._yScale();
    return d3.svg.area()
      .x(function(d) { return xScale(d[0]); })
      .y0(function(d) { return yScale(d[1]); })
      .y1(function(d) { return yScale(d[2]); })
      .interpolate("cardinal");
  }

  _yScale() {
    let min = null;
    if (typeof this.yMin === "undefined") {
      min = d3.min(this.data, function(d) { return d.min }) - 5;
    }
    else {
      min = this.yMin;
    }
    const max = d3.max(this.data, function(d) { return d.max });
    return d3.scale.linear()
      .domain([min, max+5])
      .range([this.height - this.margin.top - this.margin.bottom, 0]);
  }

  _xScale() {
    return d3.time.scale()
      .domain(d3.extent(this.data, function(d) { return d.timestamp; }))
      .range([0, this.width - this.margin.left - this.margin.right]);
  }
}

ForecastDashboard.QuartileGraph = QuartileGraph;
