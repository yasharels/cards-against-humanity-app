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
      <div className={`handWhiteCard${card === this.state.selectedWhiteCard ? ' selected' : ''}`} key={card} onClick={() => {if (data.czar !== this.props.name) this.selectWhiteCard.bind(this)(card)}}>
        <span>{card}</span>
      </div>
    ));
    const playedWhiteCards = [], roundWhiteCards = [];
    if (data.roundWhiteCards.length > 0) {
      if (this.state.ownCardsPlayed.length !== 0) this.setState({ownCardsPlayed: []});
      for (let i = 0; i < data.roundWhiteCards.length; i++) {
        let cards = [];
        for (let j = 0; j < data.roundWhiteCards[i].length; j++) {
          let text = data.roundWhiteCards[i][j];
          cards.push(<div className={`roundWhiteCard${this.props.name === data.czar && data.roundWhiteCards[i].includes(this.state.czarSelection) ? ' selected' : ''}${data.roundWhiteCards[i].includes(this.props.chosenCard) ? ' chosenCard' : ''}`} onClick={() => {if (data.czar === this.props.name) this.czarSelect.bind(this)(text)}}><span>{text}</span></div>);
        }
        roundWhiteCards.push(<div className="roundWhiteCardsContainer" key={data.roundWhiteCards[i][0]}>{cards}</div>);
      }
    }
    else {
      let index = 0;
      if (data.whiteCardsPlayed && Object.keys(data.whiteCardsPlayed).length > 0) {
        Object.keys(data.whiteCardsPlayed).forEach(group => {
          let times = data.whiteCardsPlayed[group];
          if (Number(group) === this.state.ownCardsPlayed.length) times--;
          for (let i = 0; i < times; i++) {
            let cards = [];
            for (let j = 0; j < group; j++) cards.push(<div className="playedWhiteCard"></div>);
            playedWhiteCards.push(<div className="playedWhiteCardsContainer" key={index}>{cards}</div>);
            index++;
          }
        });
      }
      let cards = [];
      this.state.ownCardsPlayed.forEach(card => cards.push(<div className="roundWhiteCard"><span>{card}</span></div>));
      playedWhiteCards.push(<div className="playedWhiteCardsContainer" key={index}>{cards}</div>);
    }
    return (
      <React.Fragment>
      <div className="blackCard">
        <span>{data.currentBlackCard.text}</span>
      </div>
      <div id="playedAndRoundWhiteCardsArea">{roundWhiteCards.length < 1 ? playedWhiteCards : roundWhiteCards}</div>
      {data.roundWhiteCards.length > 0 && this.props.name === data.czar ? <button onClick={() => this.czarSubmit.bind(this)()} id="czarSelectButton">Pick Card</button> : null}
      {data.roundWhiteCards.length < 1 && this.props.name !== data.czar ? <button disabled={this.state.ownCardsPlayed.length === data.currentBlackCard.pick} id="confirmWhiteCard" onClick={() => this.submitWhiteCard.bind(this)()
      }>Confirm Selection</button> : null}
      <div id="hand">{this.props.name === data.czar ? <div id="hand-filter"><span id="hand-filter-text">You are the card czar.</span></div> : null}{hand}</div>
      </React.Fragment>
    );
  }
}
