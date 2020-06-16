import  { connect } from 'react-redux';
import GameSetupComponent from '../components/GameSetup';

const mapStateToProps = state => {
  return {username: state.loginReducer.username}
};

export default connect(mapStateToProps)(GameSetupComponent);
