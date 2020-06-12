import React, { Component } from 'react';
import Game from './Game';
import GameSetup from './GameSetup';
import LoginArea from '../containers/LoginArea';

export default class GameRoom extends Component {
  id = this.props.match.params.id;

  state = {
    gameData: null,
    setupInit: null,
    scoreBoard: null
  };

  boundHandlers = {
    dataHandler: dataHandler.bind(this),
    gameStart: gameStartHandler.bind(this),
    gameEnd: gameEndHandler.bind(this)
  }

  componentDidMount() {
    this.props.socket.on('setupData', this.boundHandlers.dataHandler);
    this.props.socket.on('gameRoomData', this.boundHandlers.dataHandler);
    this.props.socket.on('gameStart', this.boundHandlers.gameStart);
    this.props.socket.on('gameEnd', this.boundHandlers.gameEnd);
    this.props.socket.send(JSON.stringify({event: 'joinGameRoom', payload: this.id}));
  }
  componentWillUnmount() {
    this.props.socket.off('gameRoomData');
    this.props.socket.off('gameStart');
    this.props.socket.off('gameEnd');
  }

  renderMainArea() {
    if (this.state.gameData) return <Game socket={this.props.socket} data={this.state.gameData} id={this.id} handler={this.boundHandlers.dataHandler} />;
    else if (this.state.setupData) return <GameSetup socket={this.props.socket} data={this.state.setupData} id={this.id} handler={this.boundHandlers.dataHandler}/>;
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

function dataHandler (data) {
  this.setState(data);
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
