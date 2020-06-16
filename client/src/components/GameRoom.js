import React, { Component } from 'react';
import Game from './Game';
import GameSetup from '../containers/GameSetup';
import LoginArea from '../containers/LoginArea';

export default class GameRoom extends Component {
  id = this.props.match.params.id;

  state = {
    gameData: null,
    setupInit: null,
    scoreBoard: null
  };

  boundHandlers = {
    roomDataHandler: roomDataHandler.bind(this),
    gameDataHandler: gameDataHandler.bind(this),
    setupDataHandler: setupDataHandler.bind(this),
    gameStart: gameStartHandler.bind(this),
    gameEnd: gameEndHandler.bind(this)
  }

  componentDidMount() {
    this.props.socket.on('gameRoomData', this.boundHandlers.roomDataHandler);
    this.props.socket.on('gameStart', this.boundHandlers.gameStart);
    this.props.socket.on('gameEnd', this.boundHandlers.gameEnd);
    this.props.socket.send(JSON.stringify({event: 'joinGameRoom', payload: {id: this.id}}));
  }
  componentWillUnmount() {
    this.props.socket.off('gameRoomData');
    this.props.socket.off('gameStart');
    this.props.socket.off('gameEnd');
  }
  gamePassPrompt = () => {
    const makePrompt = () => {
      const pass = prompt("Enter game password:");
      this.props.socket.send(JSON.stringify({event: 'joinGameRoom', payload: {id: this.id, pass}}));
    };
    this.props.socket.on('gameAccessDenied', makePrompt);
    makePrompt();
  }
  renderMainArea() {
    if (this.state.gameData) return <Game socket={this.props.socket} data={this.state.gameData} id={this.id} handler={this.boundHandlers.gameDataHandler} />;
    else if (this.state.setupData) return <GameSetup socket={this.props.socket} data={{...this.state.setupData, host: this.state.host}} id={this.id} handler={this.boundHandlers.setupDataHandler}/>;
    return null; // reached when no data has been received from the server yet
  }

  render() {
    return (
      <React.Fragment>
        <LoginArea socket={this.props.socket} />
        {this.renderMainArea()}
        {this.state.scoreBoard ? <ScoreBoard scores={this.state.scoreBoard} /> : null}
      </React.Fragment>
    )
  }

}

function roomDataHandler (data) {
  if (data.needsGamePass) this.gamePassPrompt();
  else this.setState(data);
}
function gameDataHandler (data) {
  this.setState({gameData: data});
}
function setupDataHandler (data) {
  this.setState({setupData: data});
}
function gameStartHandler (data) {
  this.setState({gameData: data});
}
function gameEndHandler (data) {
  this.setState({gameData: null, setupData: data});
}

class ScoreBoard extends Component {
  render() {
    const scoreData = this.props.scores;

    const rows = Object.entries(scoreData).map(([name, score], i) => (
      <tr key={i}>
        <td>
          <div>{name}</div>
          <div>{score}</div>
        </td>
      </tr>
    ));

    return (
      <table>
        <tbody>{rows}</tbody>
      </table>
    );
  }
}
