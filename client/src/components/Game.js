import React, { Component } from 'react';

export default class Game extends Component {
  componentDidMount() {
    const { socket, id } = this.props;
    if (socket.messageHandlers.gameData) socket.on("gameData", this.props.handler);
    socket.send(JSON.stringify({event: 'getGameData', payload: id}));
  }

  render() {
    return null;
  }
}
