import  { connect } from 'react-redux';
import GameRoomComponent from '../components/GameRoom';

const mapStateToProps = (state, ownProps) => {
  return state.gameRoomReducer[ownProps.match.params.id];
};

const mapDispatchToProps = dispatch => ({
  joinGameRoom: id => {
    dispatch({
      type: "JOIN_GAME_ROOM",
      payload: id
    });
  },
  leaveGameRoom: id => {
    dispatch({
      type: "LEAVE_GAME_ROOM",
      payload: id
    });
  },
  receivedGameRoomData: data => {
    dispatch({
      type: "RECEIVED_GAMEROOM_DATA",
      payload: data
    });
  },
  receivedGameOptionsData: data => {
    dispatch({
      type: "RECEIVED_GAMEOPTIONS_DATA",
      payload: data
    });
  },
  receivedGameData: data => {
    dispatch({
      type: "RECEIVED_GAME_DATA",
      payload: data
    });
  },
  gameStart: data => {
    dispatch({
      type: "GAME_START",
      payload: data
    });
  },
  gameEnd: data => {
    dispatch({
      type: "GAME_END",
      payload: data
    });
  }
});
export default connect(mapStateToProps, mapDispatchToProps)(GameRoomComponent);
