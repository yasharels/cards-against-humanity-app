import React from 'react';
import PropTypes from 'prop-types';
import LinkCard from './LinkCard';

class GameList extends React.Component {
  state = {
    games: []
  };
  boundHandlers = {
    newGameHandler: newGameHandler.bind(this),
    deleteGameHandler: deleteGameHandler.bind(this),
    gameDataChangeHandler: gameDataChangeHandler.bind(this),
    gameListHandler: gameListHandler.bind(this)
  };
  componentDidMount() {
    this.props.socket.on('newGame', this.boundHandlers.newGameHandler);
    this.props.socket.on('deleteGame', this.boundHandlers.deleteGameHandler);
    this.props.socket.on('gameDataChange', this.boundHandlers.gameDataChangeHandler);
    this.props.socket.on('gameList', this.boundHandlers.gameListHandler);
    this.props.socket.send(JSON.stringify({event: 'getGameList'}));
  }
  render() {
    return (
      <React.Fragment>
        {this.state.games.map(game => (
             <LinkCard game={game} />
        ))}
      </React.Fragment>
    );
  }
}

function newGameHandler(game) {
  this.setState(prevState => [...this.state.games, game]);
}
function deleteGameHandler(gameId) {
  this.setState(prevState =>
    prevState.filter(curGame => curGame.id !== gameId));
}
function gameDataChangeHandler(data) {
  this.setState(prevState => prevState.games.map(game =>
    game.id === data.gameId ? data.gameData : game
  ));
}
function gameListHandler(data) {
  this.setState({games: data});
}

export default GameList;
