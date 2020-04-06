import React, { Component } from 'react';

export default class Game extends Component {
  componentDidMount() {
    const { socket, id } = this.props;
    socket.on("gameData", this.props.handler);
    this.cleanup = () => {
      socket.off("gameData");
    };
    socket.send(JSON.stringify({event: 'getGameData', payload: id}));
  }

  componentWillUnmount() {
    this.cleanup();
  }

  render() {
    return null;
  }
}
