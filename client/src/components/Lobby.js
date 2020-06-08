import React, { Component } from 'react';
import LoginArea from '../containers/LoginArea'
import GameList from './GameList';

export default class Lobby extends Component {
  createGame() {
    this.props.socket.on('gameRedirect', id => {
      this.props.socket.off('gameRedirect');
      this.props.history.push(`/game/${id}`);
    });
    this.props.socket.send(JSON.stringify({event: 'createGame'}));
  }
  render() {
    return (
      <React.Fragment>
      <div id="topbar">
        <button onClick={this.createGame.bind(this)}>Create game</button>
        <div id="loginArea"><LoginArea socket={this.props.socket} /></div>
      </div>
      <GameList socket={this.props.socket} />
      </React.Fragment>
    )
  }
}
