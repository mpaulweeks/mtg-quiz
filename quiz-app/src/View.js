import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import MTG from './MTG';
import './MTG.css';

const Card = function(props){
  const {
    display,
  } = props
  return (
    <div className={`Card Card-color-${display.color} ${display.pt ? 'has-pt' : ''} ${display.anonymize ? 'clickable' : ''}`} onClick={display.callback}>
      <div className="Card-name">
        {display.name}
      </div>
      <div className="Card-type">
        {display.type}
      </div>
      <div className="Card-text">
        {display.body.split("\n").map(function(line, index) {
          return <div className="Card-text-line" key={index}>{MTG.ViewHelper.getTextNode(line)}</div>
        })}
      </div>
      <div className="Card-cost">
        {MTG.ViewHelper.getTextNode(display.cost)}
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
      cards: MTG.Data.randomPair(),
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
        cards: MTG.Data.randomPair(),
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
    const display1 = MTG.ViewHelper.cardDisplay(cards.card1, anonymize, this.callback);
    const display2 = MTG.ViewHelper.cardDisplay(cards.card2, anonymize, this.callback);
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
          <button className="Next clickable" onClick={this.callback}>
            Next Card
          </button>
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
      MTG.Data.init(data);
      ReactDOM.render(
        <Manager />,
        document.getElementById('root')
      );
    });
};

export default View;
