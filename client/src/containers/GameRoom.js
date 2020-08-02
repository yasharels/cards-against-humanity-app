import  { connect } from 'react-redux';
import GameRoomComponent from '../components/GameRoom';

const mapStateToProps = (state, ownProps) => {
  return {...state.gameRoomReducer[ownProps.match.params.id], name: state.loginReducer.username};
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
  gameDataChange: data => {
    dispatch({
      type: "GAME_DATA_CHANGE",
      payload: data
    });
  },
  gameStart: data => {
    dispatch({
      type: "GAME_START",
      payload: data
    });
  },
  roundEnd: data => {
    dispatch({
      type: "ROUND_END",
      payload: data
    });
  },
  whiteCardChosen: data => {
    dispatch({
      type: "WHTIE_CARD_CHOSEN",
      payload: data
    });
  }
});
export default connect(mapStateToProps, mapDispatchToProps)(GameRoomComponent);
