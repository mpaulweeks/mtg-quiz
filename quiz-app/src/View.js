import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import MTG from './MTG';
import './MTG.css';

const View = {};
View.Helper = {};
View.Helper.parseText = function(line) {
  const parts = [];
  const openers = line.split('{');
  openers.forEach(function (opener){
    const oParts = opener.split('}');
    if (oParts.length < 1 || oParts.length > 2){
      throw line
    }
    let vanilla = oParts[0];
    if (oParts.length === 2){
      vanilla = oParts[1];
      parts.push({
        text: oParts[0],
        isSymbol: true,
      });
    }
    parts.push({
      text: vanilla,
      isSymbol: false,
    });
  })
  return parts;
};
View.Helper.getTextNode = function(line) {
  const parts = View.Helper.parseText(line);
  return parts.map(function(part, index) {
    if (part.isSymbol){
      return <img key={index} className="symbol" alt={part.text} src={`symbol/${part.text}.svg`} />;
    }
    return part.text;
  });
};
View.Helper.cardDisplay = function(cData, anonymize, callback){
  const display = {
    id: cData.name,
    key: cData.name + anonymize,
    name: cData.name,
    cost: (cData.manaCost || '{0}'),
    type: cData.type,
    body: cData.text || '',
    pt: "",
    color: 'Colorless',
    callback: function(){callback(display)},
  };
  if (anonymize){
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
  if (cData.hasOwnProperty('power')){
    display.pt = cData.power + '/' + cData.toughness;
  }
  if (cData.colors){
    if (cData.colors.length > 1){
      display.color = 'Gold';
    } else if (cData.colors.length === 1){
      display.color = cData.colors[0];
    }
  }
  return display;
};

const Card = function(props){
  const {
    display,
  } = props
  return (
    <div className={`Card Card-color-${display.color} ${display.pt ? 'has-pt' : ''}`} onClick={display.callback}>
      <div className="Card-name">
        {display.name}
      </div>
      <div className="Card-type">
        {display.type}
      </div>
      <div className="Card-text">
        {display.body.split("\n").map(function(line, index) {
          return <div className="Card-text-line" key={index}>{View.Helper.getTextNode(line)}</div>
        })}
      </div>
      <div className="Card-cost">
        {View.Helper.getTextNode(display.cost)}
      </div>
      <div className="Card-pt">
        {display.pt}
      </div>
    </div>
  )
}

class Manager extends Component {
  constructor(){
    super();
    this.callback = this.callback.bind(this);
    this.state = {
      cards: MTG.randomPair(),
      anonymize: true,
      right: 0,
      wrong: 0,
    };
  }
  callback(chosenCard){
    var newState = {
      anonymize: !this.state.anonymize,
    };
    if (newState.anonymize){
      Object.assign(newState, {
        cards: MTG.randomPair(),
        wasRight: false,
        wasWrong: false,
      });
    } else {
      var winningCard = this.state.cards.winningCard;
      if (chosenCard.id === winningCard.name){
        Object.assign(newState, {
          right: this.state.right + 1,
          wasRight: true,
          wasWrong: false,
        });
      } else {
        Object.assign(newState, {
          wrong: this.state.wrong + 1,
          wasRight: false,
          wasWrong: true,
        });
      }
    }
    this.setState(newState);
  }
  render() {
    const {
      anonymize,
      cards,
    } = this.state
    const display1 = View.Helper.cardDisplay(cards.card1, anonymize, this.callback);
    const display2 = View.Helper.cardDisplay(cards.card2, anonymize, this.callback);
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
          <Card key={display1.key} display={display1} />
          <Card key={display2.key} display={display2} />
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

View.initApp = function(){
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

export default View;
