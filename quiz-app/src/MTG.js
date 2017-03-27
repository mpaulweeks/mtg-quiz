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
    display.cost = (cData.manaCost || '{0}');
    display.type = cData.type;
    display.body = cData.text || '';
    if (props.anonymize){
      display.name = 'CARDNAME';
      display.cost = '???';
      display.type = cData.types.join(' ');
      if (cData.type.indexOf(' — Equipment') !== -1){
        display.type += ' — Equipment';
      }
      if (cData.type.indexOf(' — Aura') !== -1){
        display.type += ' — Aura';
      }
      display.body = display.body.replace(new RegExp(cData.name, 'g'), display.name);
    }
    display.pt = "";
    if (cData.hasOwnProperty('power')){
      display.pt = cData.power + '/' + cData.toughness;
    }
    display.color = 'Colorless';
    if (cData.colors){
      if (cData.colors.length > 1){
        display.color = 'Gold';
      } else if (cData.colors.length === 1){
        display.color = cData.colors[0];
      }
    }
    // console.log(cData);
    this.state = {
      cData: cData,
      display: display,
      callback: function(){props.callback(cData);},
    }
  }
  componentDidMount(){
    var textNodes = Array.prototype.slice.call(document.getElementsByClassName('Card-text'));
    var costNodes = Array.prototype.slice.call(document.getElementsByClassName('Card-cost'));
    textNodes.concat(costNodes).forEach(function (node){
      node.innerHTML = node.innerHTML.replace(/\{(\w)\}/g, '<img class="symbol" src="symbol/$1.svg" />');
    });
  }
  render() {
    return (
      <div className={"Card Card-color-" + this.state.display.color + (this.state.display.pt ? ' has-pt' : '')} onClick={this.state.callback}>
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
      newState.wasRight = true;
      newState.wasWrong = false;
    } else {
      newState.wrong = this.state.wrong + 1;
      newState.wasRight = false;
      newState.wasWrong = true;
    }
    this.setState(newState);
  }
  reload() {
    this.setState({
      anonymize: true,
      callback: this.state.onClick,
      cards: MTG.randomPair(),
      wasRight: false,
      wasWrong: false,
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
        One of these cards costs {1} more mana than the other.
        Click on the card you think costs more!
        <div className="Scoreboard">
          <div className="Right Container">
            <div className={"Count" + (this.state.wasRight ? ' highlight' : '')}>
              Right: {this.state.right}
            </div>
          </div>
          <div className="Wrong Container">
            <div className={"Count" + (this.state.wasWrong ? ' highlight' : '')}>
              Wrong: {this.state.wrong}
            </div>
          </div>
        </div>
        <div className="Card-Container">
          <Card key={card0key} cData={card0} anonymize={anonymize} callback={callback} />
          <Card key={card1key} cData={card1} anonymize={anonymize} callback={callback} />
        </div>
        {!anonymize &&
          <div>Click again to continue.</div>
        }
      </div>
    )
  }
}

function Loading(){
  return (
    <div className="Manager">
      <div className="Title">
        loading, please wait...
      </div>
    </div>
  )
}

function Error(){
  return (
    <div className="Manager">
      <div className="Title">
        there was an error loading AllCards.json
      </div>
    </div>
  )
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
  // console.log('binning', dataArray.length);
  dataArray.forEach(function(cData){
    var colorKey = (cData.colors || []).join('|');
    byColors[colorKey] = byColors[colorKey] || [];
    byColors[colorKey].push(cData);
  });
  Object.keys(byColors).forEach(function(colorKey){
    var colorData = byColors[colorKey];
    // console.log('graphing', colorKey, colorData.length);
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
    const cmc = cData.cmc || 0;
    const isComplicated = (cData.text || "").split('\n').length > 1;
    const isWalker = (cData.type || '').indexOf("Planeswalker") !== -1;
    return (
      cmc <= 8 &&
      isComplicated &&
      !isWalker
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
  ReactDOM.render(
    <Loading />,
    document.getElementById('root')
  );
  fetch('./AllCards.json')
    .then(function(response) {
      if (response.status >= 400) {
        ReactDOM.render(
          <Error />,
          document.getElementById('root')
        );
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
  return MTG;
};
window.MTG = MTG.publicAPI();

export default MTG;
