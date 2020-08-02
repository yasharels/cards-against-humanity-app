import React, { Component } from 'react';
import '../Game.css';

export default class Game extends Component {
  state = {
    selectedWhiteCard: null,
    czarSelection: null,
    ownCardsPlayed: []
  };
  selectWhiteCard(card) {
    this.setState({selectedWhiteCard: card});
  }
  submitWhiteCard() {
    this.props.socket.send(JSON.stringify({event: 'submitWhiteCard', payload: {id: this.props.id, card: this.state.selectedWhiteCard}}));
    let hand = this.props.data.hand.slice();
    let index = hand.indexOf(this.state.selectedWhiteCard);
    hand.splice(index, 1);
    this.props.gameDataHandler({id: this.props.id, data: {hand}});
    this.setState({ownCardsPlayed: [...this.state.ownCardsPlayed, this.state.selectedWhiteCard], selectedWhiteCard: null});
  }
  czarSelect(card) {
    if (this.props.name !== this.props.data.czar) return;
    this.setState({czarSelection: card});
  }
  czarSubmit() {
    this.props.socket.send(JSON.stringify({event: 'chooseSubmission', payload: {id: this.props.id, card: this.state.czarSelection}}));
    this.setState({czarSelection: null});
  }
  componentDidMount() {
    const { socket, id, data } = this.props;
    if (!socket.messageHandlers.gameData) {
      socket.on("gameData", this.props.gameDataHandler);
      socket.on("whiteCardChosen", msg => {
        this.props.whiteCardChosen(msg);
        this.props.roundEndHandler(msg);
      });
    }
    socket.send(JSON.stringify({event: 'getGameData', payload: id}));
  }

  render() {
    let data = this.props.data;
    let sock = this.props.socket;
    const hand = data.hand.map(card => (
      <div id={card === this.state.selectedWhiteCard ? 'selected' : null} className="whiteCard" key={card} onClick={() => {if (data.czar !== this.props.name) this.selectWhiteCard.bind(this)(card)}}>
        <span key={card}>{card}</span>
      </div>
    ));
    const playedWhiteCards = [], roundWhiteCards = [];
    if (data.roundWhiteCards.length > 0) {
      if (this.state.ownCardsPlayed.length !== 0) this.setState({ownCardsPlayed: []});
      for (let i = 0; i < data.roundWhiteCards.length; i++) {
        let cards = [];
        for (let j = 0; j < data.roundWhiteCards[i].length; j++) {
          cards.push(<div className={`roundWhiteCard${this.props.name === data.czar && data.roundWhiteCards[i].includes(this.state.czarSelection) ? ' czarSelected' : ''}${data.roundWhiteCards[i].includes(this.props.chosenCard) ? 'chosenCard' : ''}`} onClick={() => {if (data.czar === this.props.name) this.czarSelect.bind(this)(data.roundWhiteCards[i][j])}}><span>{data.roundWhiteCards[i][j]}</span></div>);
        }
        roundWhiteCards.push(<div className="roundWhiteCardsContainer" key={i}>{cards}</div>);
      }
    }
    else {
      for (let i = 0; i < data.whiteCardsPlayed; i++) playedWhiteCards.push(<div className="playedWhiteCard" key={i}></div>);
      this.state.ownCardsPlayed.forEach(card => playedWhiteCards.push(<div className="roundWhiteCard"><span>{card}</span></div>));
    }
    return (
      <React.Fragment>
      <div className="blackCard">
        <span>{data.currentBlackCard.text}</span>
      </div>
      {data.roundWhiteCards.length > 0 && this.props.name === data.czar ? <button onClick={() => this.czarSubmit.bind(this)()} id="czarSelectButton">Pick Card</button> : null}
      {data.roundWhiteCards.length < 1 && this.props.name !== data.czar ? <button disabled={this.state.ownCardsPlayed.length === data.currentBlackCard.pick} id="confirmWhiteCard" onClick={() => this.submitWhiteCard.bind(this)()
      }>Confirm Selection</button> : null}
      {roundWhiteCards.length < 1 ? <div id="playedWhiteCards">{playedWhiteCards}</div> : <div id="roundWhiteCards">{roundWhiteCards}</div>}
      <div id="hand">{hand}</div>
      </React.Fragment>
    );
  }
}
