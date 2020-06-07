import React, { Component } from 'react';

export default class GameSetup extends Component {
  state = {};

  dataHandler(data) {
    this.setState(data);
  }
  componentDidMount() {
    const { socket, id } = this.props;
    this.dataHandler = this.dataHandler.bind(this);
    socket.on("gameSetupData", this.dataHandler);
    this.cleanup = () => {
      socket.off("gameSetupData");
    };
    socket.send(JSON.stringify({event: 'getSetupData', payload: id}));
  }
  componentWillUnmount() {
    this.cleanup();
  }

  render() {
    return null;
  }
}
