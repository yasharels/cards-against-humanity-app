import App from '../App';
import { connect } from 'react-redux';

const mapStateToProps = state => {
  return {isLoading: state.connectReducer.isLoading}
};

export default connect(mapStateToProps)(App);
