import _ from 'lodash';
import config from './config';
const configDev = (process.env.NODE_ENV == 'development') ? require('./config.dev.js').default : null;

export default _.merge({}, config, configDev);
