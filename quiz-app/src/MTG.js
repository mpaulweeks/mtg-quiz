import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './MTG.css';

const MTG = {};

class Card extends Component {
  constructor(props) {
    super(props);
    const cData = props.cData;
    const display = {};
    display.name = cData.name;
    display.cost = (cData.manaCost || '0').replace(/\{|\}/g, '');
    display.type = cData.type;
    display.body = cData.text || '';
    if (props.anonymize){
      display.name = '[CARD NAME]';
      display.cost = '???';
      display.type = cData.types.join(' ');
      if (cData.type.indexOf('Equipment') !== -1){
        display.type += ' - Equipment';
      }
      display.body = display.body.replace(new RegExp(cData.name, 'g'), display.name);
    }
    display.pt = "";
    if (cData.hasOwnProperty('power')){
      display.pt = cData.power + '/' + cData.toughness;
    }
    console.log(cData);
    this.state = {
      cData: cData,
      display: display,
      callback: function(){props.callback(cData);},
    }
  }
  render() {
    return (
      <div className={"Card " + (this.state.display.pt ? 'has-pt' : '')} onClick={this.state.callback}>
        <div className="Card-name">
          {this.state.display.name}
        </div>
        <div className="Card-type">
          {this.state.display.type}
        </div>
        <div className="Card-text">
          {this.state.display.body.split("\n").map(function(line, index) {
            return <div className="Card-text-line" key={index}>{line}</div>
          })}
        </div>
        <div className="Card-cost">
          {this.state.display.cost}
        </div>
        <div className="Card-pt">
          {this.state.display.pt}
        </div>
      </div>
    )
  }
}

class Manager extends Component {
  constructor(){
    super();
    this.onClick = this.onClick.bind(this);
    this.reload = this.reload.bind(this);
    this.state = {
      cards: MTG.randomPair(),
      anonymize: true,
      right: 0,
      wrong: 0,
      callback: this.onClick,
      onClick: this.onClick,
      reload: this.reload,
    };
  }
  onClick(chosenCard){
    var newState = {
      anonymize: false,
      callback: this.state.reload,
    };
    var winningCard = this.state.cards[0];
    if (this.state.cards[0].graphCost.functionalCost < this.state.cards[1].graphCost.functionalCost){
      winningCard = this.state.cards[1];
    }
    if (chosenCard.name === winningCard.name){
      newState.right = this.state.right + 1;
    } else {
      newState.wrong = this.state.wrong + 1;
    }
    this.setState(newState);
  }
  reload() {
    this.setState({
      anonymize: true,
      callback: this.state.onClick,
      cards: MTG.randomPair(),
    });
  }
  render() {
    const anonymize = this.state.anonymize;
    const callback = this.state.callback;
    const card0 = this.state.cards[0];
    const card0key = card0.name + anonymize;
    const card1 = this.state.cards[1];
    const card1key = card1.name + anonymize;
    return (
      <div className="Manager">
        <div className="Title">
          MTG QUIZ
        </div>
        <div className="Container">
          <Card key={card0key} cData={card0} anonymize={anonymize} callback={callback} />
          <Card key={card1key} cData={card1} anonymize={anonymize} callback={callback} />
        </div>
        <div className="Scoreboard">
          Right: {this.state.right}
          Wrong: {this.state.wrong}
        </div>
      </div>
    )
  }
}

MTG.get = {};
MTG.get.cardCost = function(cData){
  if (cData.graphCost){
    return cData.graphCost;
  }
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
      functionalCost += 100 * count;
    }
  });
  cData.graphCost = {
    bins: bins,
    functionalCost: functionalCost,
  };
  return cData.graphCost;
}
MTG.get.cardDistance = function(cData1, cData2){
  const cost1 = MTG.get.cardCost(cData1);
  const cost2 = MTG.get.cardCost(cData2);
  if (cost1 && cost2){
    return Math.abs(cost1.functionalCost - cost2.functionalCost);
  }
  return null;
}
MTG.drawGraph = function(dataArray){
  var byColors = {};
  console.log('binning', dataArray.length);
  dataArray.forEach(function(cData){
    var colorKey = (cData.colors || []).join('|');
    byColors[colorKey] = byColors[colorKey] || [];
    byColors[colorKey].push(cData);
  });
  Object.keys(byColors).forEach(function(colorKey){
    var colorData = byColors[colorKey];
    console.log('graphing', colorKey, colorData.length);
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
  var dataArray = Object.values(data);
  dataArray = dataArray.filter(function(cData){
    var cmc = cData.cmc || 0;
    var body = cData.text || "";
    return (
      2 <= cmc && cmc <= 6 &&
      body.split('\n').length > 1
    );
  })
  return dataArray;
};
MTG.filterDataArray = function(dataArray){
  return dataArray.filter(function(cData){
    return cData.neighbors.length > 0;
  });
};
MTG.addMetaData = function(dataArray){
  MTG.drawGraph(dataArray);
  return dataArray;
};
MTG.rigData = function(data){
  MTG.rawData = data;
  MTG.dataArray = MTG.filterDataArray(
    MTG.addMetaData(
      MTG.filterData(data)
    )
  );
  return MTG.dataArray;
};
MTG.random = function(arr){
  return arr[Math.floor(Math.random()*arr.length)];
}
MTG.randomPair = function(){
  const cData1 = MTG.random(MTG.dataArray);
  const cData2 = MTG.random(cData1.neighbors);
  return [cData1, cData2];
}
MTG.init = function(){
  fetch('./AllCards.json')
    .then(function(response) {
      if (response.status >= 400) {
         throw new Error("Bad response from server");
      }
      return response.json();
    })
    .then(function(data) {
      MTG.rigData(data);
      ReactDOM.render(
        <Manager />,
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
