import React, { Component } from 'react';
import Game from './Game';
import GameSetup from './GameSetup';
import Chat from './Chat';
import LoginArea from '../containers/LoginArea';
import '../GameRoom.css';

export default class GameRoom extends Component {
  id = this.props.match.params.id;

  boundHandlers = {
    gameDataHandler: gameDataHandler.bind(this),
    gameOptionsHandler: gameOptionsHandler.bind(this),
    roundEndHandler: roundEndHandler.bind(this),
    whiteCardChosen: whiteCardChosen.bind(this)
  }

  componentDidMount() {
    let sock = this.props.socket;
    if (!sock.messageHandlers.gameRoomData) {
      sock.on('gameRoomData', this.roomDataHandler.bind(this));
      sock.on('gameStart', this.props.gameStart);
      sock.on('gameIdInvalid', () => alert("This game does not exist."));
      sock.on('chatMessage', this.props.chatMessageHandler);
    }
    this.props.joinGameRoom(this.id);
    sock.send(JSON.stringify({event: 'joinGameRoom', payload: {id: this.id}}));
  }
  componentWillUnmount() {
    this.props.socket.send(JSON.stringify({event: 'leaveGameRoom', payload: {id: this.id}}));
    this.props.leaveGameRoom(this.id);
  }
  roomDataHandler(data) {
    if (data.needsGamePass) this.gamePassPrompt({id: data.id});
    else this.props.receivedGameRoomData(data);
  }
  gamePassPrompt = outerData => {
    const makePrompt = innerData => {
      const pass = prompt("Enter game password:");
      this.props.socket.send(JSON.stringify({event: 'joinGameRoom', payload: {id: innerData.id, pass}}));
    };
    this.props.socket.on('gameAccessDenied', makePrompt);
    makePrompt(outerData);
  }
  renderMainArea() {
    if (this.props.gameData) return <Game socket={this.props.socket} data={{...this.props.gameData, gamePoint: this.props.gameOptions.gamePoint, scoreBoard: this.props.scoreBoard}} name={this.props.name} id={this.id} roundEndHandler={this.boundHandlers.roundEndHandler} whiteCardChosen={this.boundHandlers.whiteCardChosen} gameDataHandler={this.boundHandlers.gameDataHandler} />;
    else if (this.props.gameOptions) return <GameSetup socket={this.props.socket} data={{...this.props.gameOptions, host: this.props.host}} players={Object.keys(this.props.scoreBoard)} name={this.props.name} id={this.id} handler={this.boundHandlers.gameOptionsHandler}/>;
    return null; // reached when no data has been received from the server yet
  }

  render() {
    return (
      <React.Fragment>
        <div id="gameroomTop"><LoginArea socket={this.props.socket} /></div>
        <div id="mainArea">{this.renderMainArea()}</div>
        <div id="gameroomBottom">
          {this.props.scoreBoard ? <ScoreBoard scores={this.props.scoreBoard} host={this.props.host} /> : null}
          <Chat id={this.id} socket={this.props.socket} name={this.props.name} chatLog={this.props.chatLog} />
        </div>
      </React.Fragment>
    )
  }

}


function gameDataHandler (data) {
  this.props.gameDataChange(data);
}
function gameOptionsHandler (data) {
  this.props.receivedGameOptionsData(data);
}
function roundEndHandler (data) {
  this.props.roundEnd(data);
}
function whiteCardChosen (data) {
  this.props.whiteCardChosen(data);
}

class ScoreBoard extends Component {
  render() {
    const scoreData = this.props.scores;
    const rows = Object.entries(scoreData).map(([name, score], i) => (
      <div className="scorecard" key={i}>
          <div className="scoreboardName">{name}</div>
          <div><span className="scoreboardPoints">{score}</span> points {this.props.host === name && <span className="host">Host</span>} </div>
      </div>
    ));

    return (
      <React.Fragment>
        <div className="scoreboard">
          <div className="scoreboardTitle">Scoreboard</div>
          {rows}
        </div>
      </React.Fragment>
    );
  }
}
