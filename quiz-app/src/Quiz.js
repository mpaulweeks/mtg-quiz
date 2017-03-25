import React, { Component } from 'react';
import './App.css';

function Title(card) {
  return (
    <h3 className="square" onClick={() => props.onClick()}>
      {card.name}
    </h3>
  );
}

class Card extends Component {
  renderTitle() {
    const card = this.props.card;
    return <Square value={squares[i]} onClick={() => this.props.onClick(i)} />;
  }
  render() {
    return (
      <div>
        {this.renderTitle()}
      </div>
    )
  }
}

fetch('./AllCards.json')
  .then(function(response) {
  if (response.status >= 400) {
     throw new Error("Bad response from server");
  }
  return response.json();
})
.then(function(data) {
   console.log(data);
   const card = data['Masticore'];
   ReactDOM.render(
    <Game card={card} />,
    document.getElementById('container')
  );
});

export default Card;
