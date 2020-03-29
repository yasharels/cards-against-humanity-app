import { combineReducers } from 'redux';
import connectReducer from './connect';
import loginReducer from './login';

const rootReducer = combineReducers({
  connectReducer,
  loginReducer
});

export default rootReducer;
