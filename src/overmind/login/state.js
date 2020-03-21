import config from '../../config'
export default {
  domain: config.oada && config.oada.url ? config.oada.url : '',
}
