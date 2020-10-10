import React, { Component } from 'react';
import PropTypes from 'prop-types';
import GameInfoBox from './GameInfoBox';

export default class GameList extends Component {
  constructor(props) {
    super(props);
    this.newGameHandler = this.newGameHandler.bind(this);
    this.deleteGameHandler = this.deleteGameHandler.bind(this);
    this.gameDataChangeHandler = this.gameDataChangeHandler.bind(this);
    this.gameListHandler = this.gameListHandler.bind(this);
  }

  state = {
    gamesData: []
  };

  newGameHandler(gameData) {
    this.setState({
      gamesData: [...this.state.gamesData, gameData]
    });
  }
  deleteGameHandler(gameId) {
    this.setState({
      gamesData: this.state.gamesData.filter(curData => curData.id !== gameId)
    });
  }
  gameDataChangeHandler(data) {
    this.setState({
      gamesData: this.state.gamesData.map(curData => curData.id === data.gameId ? {...curData, ...data.gameData} : curData)
    });
  }
  gameListHandler(data) {
    this.setState({gamesData: data});
  }
  componentDidMount() {
    this.props.socket.on('newGame', this.newGameHandler);
    this.props.socket.on('deleteGame', this.deleteGameHandler);
    this.props.socket.on('gameDataChange', this.gameDataChangeHandler);
    this.props.socket.on('gameList', this.gameListHandler);
    this.props.socket.send(JSON.stringify({event: 'getGameList'}));
  }

  render() {
    return (
      <React.Fragment>
        <div className="gameList">
          {this.state.gamesData.map(gameData => (
            <GameInfoBox gameData={gameData} />
          ))}
        </div>
      </React.Fragment>
    );
  }
}
