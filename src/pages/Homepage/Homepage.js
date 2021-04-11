import Chart from "react-apexcharts";
import "./Homepage.css"
import Search from './tickerSearch.js'
import React from "react";
import { getSMA, getCandleEMA, linetocandle, getMACD, getHistogram } from './algorithms.js'

const queryString = require("query-string")

class Homepage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ticker: "",
      data: null,
      sma: null,
      sma2: null,
      macd: null,
      signal: null,
      annotations:null,
    };
  }

  handleSubmit = (event) => {
    event.preventDefault();
    var ticker = event.target[0].value;
    var interval = event.target[1].value;
    var sDate = event.target[2].value;
    var eDate = event.target[3].value;
    var limit = event.target[4].value;

    var params = {
      sDate: sDate !== "" ? sDate : undefined,
      eDate: eDate !== "" ? eDate : undefined,
      interval: interval,
      limit: limit,
    };

    var query = queryString.stringify(params);
    console.log(query)

    fetch(`/ticker/${ticker}${query !== "" ? "?" + query : ""}`)
    .then(res => res.json())
    .then(data => {
      this.setState({
          data: data,
          sma: getSMA(data, 5),
          sma2: getSMA(data, 20),
          macd: getMACD(data,26,12),
          signal: getSMA(linetocandle(getMACD(data,26,12)),9),
          annotations: getCross()
        })
    })
  }
  
  render () {
    var options = {
      chart: {
        group: "combine",
        id: "candlestick",
      },
      annotations: {
        xaxis: this.state.annotations,
      },
      yaxis: {
        labels: {
          style: {
            colors: ["#000000"],
          },
          // The reason for the if else is that sometiems val returns null
          // This could cause the 'toFixed' (built in round) to fail as its cant round null
          // which would crash
          formatter: function (val) {
            if(val === null){
              return val;
            }else{
              return `$${val.toFixed(2)}`;
            }
          },
          minWidth: 40
        },
      },
      tooltip: {
        enabled: true,
        shared: true,
      },
      markers: {
        size: .5,
      },
      stroke: {
        width: [1, 5, 5],
      },
    };
    return (
      <div className="App-header">
        <Search onSubmit={this.handleSubmit} />
        <br />
        {this.state.data !== null &&
          this.state.sma !== null && (
            <div>
              <Chart
                options={options}
                series={[
                  {
                    name: "close",
                    type: "candlestick",
                    data: this.state.data,
                  },
                  {
                    name: "sma5",
                    type: "line",
                    data: this.state.sma,
                  },
                  {
                    name: "sma20",
                    type: "line",
                    data: this.state.sma2,
                  },
                ]}
                className="candlestickchart"
                width="1200px"
                height="750px"
              />
              <br />
              <Chart
                options={{
                  chart: {
                    group: "combine",
                    id: "macd",
                    type: "line",
                  },
                  yaxis: {
                    labels: {
                      minWidth: 40
                    }
                  },
                  markers: {
                    size: .5,
                  },
                  stroke: {
                    width: [2,2],
                  },
                  plotOptions: {
                    bar: {
                      colors: {
                        ranges: [{
                          from: -1000,
                          to: 0,
                          color: '#de0408'
                        }, {
                          from: 0,
                          to: 1000,
                          color: '#1bfa44'
                        }]
                      }
                    }
                  },
                  stroke: {
                    width: [2,2,0],
                  }
                }}
                series={[
                  {
                    name: "macd",
                    type: "line",
                    data: this.state.macd,
                  },
                  {
                    name: "signal",
                    type: "line",
                    data: this.state.signal,
                  },
                  {
                    name:"test",
                    type: "bar",
                    data: getHistogram(this.state.macd, this.state.signal)
                  },
                ]}
                className = "macdchart"
                height = "300px"
              />
            </div>
          )}
      </div>
    );
  }
}

export default Homepage;
