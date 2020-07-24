import { combineReducers } from 'redux';
import connectReducer from './connect';
import loginReducer from './login';
import gameRoomReducer from './gameRoomReducer';

const rootReducer = combineReducers({
  connectReducer,
  loginReducer,
  gameRoomReducer
});

export default rootReducer;
