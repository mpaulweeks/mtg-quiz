import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './MTG.css';

var MTG = {};

class Card extends Component {
  constructor(props) {
    super(props);
    var cData = props.cData;
    console.log(cData);
    cData.body = cData.text || "";
    cData.pt = "";
    if (cData.hasOwnProperty('power')){
      cData.pt = cData.power + '/' + cData.toughness;
    }
    cData.cost = MTG.get.cardCost(cData);
    cData.onClick = function(){};
    this.cData = cData;
  }
  render() {
    return (
      <div className="Card" onClick={() => this.cData.onClick()}>
        <div className="Card-name">
          {this.cData.name}
        </div>
        <div className="Card-type">
          {this.cData.type}
        </div>
        <div className="Card-text">
          {this.cData.body.split("\n").map(function(line, index) {
            return <div className="Card-text-line" key={index}>{line}</div>
          })}
        </div>
        <div className="Card-pt">
          {this.cData.pt}
        </div>
      </div>
    )
  }
}

function Manager(props) {
  const card1 = props.data['Cryptic Command'];
  // const card2 = props.data['Fog'];
  // const card1 = props.data['Glory Seeker'];
  // const card2 = props.data['Soulless One'];
  // const card2 = props.data['Monastery Mentor'];
  const card2 = props.data['Kozilek, the Great Distortion'];
  return (
    <div className="Manager">
      <div className="Title">
        MTG QUIZ
      </div>
      <div className="Container">
        <Card cData={card1} />
        <Card cData={card2} />
      </div>
      <div className="Options">
        Question
      </div>
    </div>
  )
}

MTG.get = {};
MTG.get.cardCost = function(cData){
  if (!cData.manaCost || cData.manaCost.indexOf('/') > -1){
    return null;
  }
  var bins = {
    'A': 0,
    'C': 0,
    'W': 0,
    'U': 0,
    'B': 0,
    'R': 0,
    'G': 0,
  };
  var symbols = cData.manaCost.replace(/\{/g, '').split('}');
  symbols.forEach(function (s){
    if (s.length > 0){
      var num = parseInt(s, 10);
      if (!isNaN(num)){
        bins.A += num;
      } else {
        bins[s] += 1;
      }
    }
  });
  var functionalCost = 0;
  Object.keys(bins).forEach(function(key){
    var count = bins[key];
    if (key === 'A'){
      functionalCost += count;
    } else {
      functionalCost += 2 * count;
    }
  });
  return {
    bins: bins,
    functionalCost: functionalCost,
  };
}
MTG.get.cardDistance = function(cData1, cData2){
  const cost1 = MTG.get.cardCost(cData1);
  const cost2 = MTG.get.cardCost(cData2);
  if (cost1 && cost2){
    return Math.abs(cost1.functionalCost - cost2.functionalCost);
  }
  return null;
}
MTG.drawGraph = function(data){
  var byColors = {};
  Object.keys(data).forEach(function(cKey){
    var cData = data[cKey];
    var colorKey = (data.colors || []).join('|');
    byColors[colorKey] = byColors[colorKey] || [];
    byColors[colorKey].push(cData);
  });
  Object.keys(byColors).forEach(function(colorKey){
    var colorData = byColors[colorKey];
    colorData.forEach(function(cData1){
      cData1.neighbors = [];
      colorData.forEach(function(cData2){
        if(MTG.get.cardDistance(cData1, cData2) === 1){
          cData1.neighbors.push(cData2);
        }
      });
    });
  });
}
MTG.filterData = function(data){
  return data;
};
MTG.addMetaData = function(data){
  // MTG.drawGraph(data);
  return data;
};
MTG.rigData = function(data){
  MTG.data = MTG.addMetaData(MTG.filterData(data));
  return MTG.data;
};
MTG.init = function(){
  fetch('./AllCards.json')
    .then(function(response) {
      if (response.status >= 400) {
         throw new Error("Bad response from server");
      }
      return response.json();
    })
    .then(function(data) {
      data = MTG.rigData(data);
      ReactDOM.render(
        <Manager data={data} />,
        document.getElementById('root')
      );
    });
};
MTG.publicAPI = function(){
  return {
    data: MTG.data,
  }
};
window.MTG = MTG.publicAPI();

export default MTG;
