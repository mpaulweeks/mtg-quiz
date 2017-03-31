import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import MTG from './MTG';
import './MTG.css';

const Card = function(props){
  function renderSymbol(char, key) {
    return <img className="symbol" alt={char} src={`symbol/${char}.svg`} key={key} />
  }
  function parseText(line) {
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
  }
  function getCostNode(line) {
    const parts = parseText(line);
    return parts.map(function(line, index) {
      if (line.isSymbol){
        return renderSymbol(line.text, index);
      }
      return line.text;
    });
  }

  const {
    display,
    callback,
  } = props
  return (
    <div className={`Card Card-color-${display.color} ${display.pt ? 'has-pt' : ''}`} onClick={callback}>
      <div className="Card-name">
        {display.name}
      </div>
      <div className="Card-type">
        {display.type}
      </div>
      <div className="Card-text">
        {display.body.split("\n").map(function(line, index) {
          return <div className="Card-text-line" key={index}>{getCostNode(line)}</div>
        })}
      </div>
      <div className="Card-cost">
        {getCostNode(display.cost)}
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
    var winningCard = this.state.cards.winningCard;
    if (chosenCard.id === winningCard.name){
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
    function cardDisplayModel(cData, anonymize){
      const display = {
        id: cData.name,
        name: cData.name,
        cost: (cData.manaCost || '{0}'),
        type: cData.type,
        body: cData.text || '',
        pt: "",
        color: 'Colorless',
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
    }
    const anonymize = this.state.anonymize;
    const callback = this.state.callback;
    const card0 = this.state.cards.card1;
    const card0key = card0.name + anonymize;
    const display0 = cardDisplayModel(card0, anonymize);
    const card1 = this.state.cards.card2;
    const card1key = card1.name + anonymize;
    const display1 = cardDisplayModel(card1, anonymize);
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
          <Card key={card0key} display={display0} callback={function(){callback(display0)}} />
          <Card key={card1key} display={display1} callback={function(){callback(display1)}} />
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

const View = {};
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
