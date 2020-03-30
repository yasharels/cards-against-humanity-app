import React, { Component } from 'react';
import LoginArea from '../containers/LoginArea'
import GameList from './GameList';

class Lobby extends Component {
  createGame() {
    this.props.socket.send(JSON.stringify({event: 'createGame'}));
  }
  render() {
    return (
      <React.Fragment>
      <div id="topbar">
        <button onClick={this.createGame}>Create game</button>
        <div id="loginArea"><LoginArea socket={this.props.socket} /></div>
      </div>
      <GameList socket={this.props.socket} />
      </React.Fragment>
    )
  }
}


export default Lobby;
