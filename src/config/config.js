import _ from 'lodash';

const config = {
  oada: {
//    url: 'https://smithfield.trellis.one',
    url: 'https://localhost',
    devcert: require('./dev-cert/signed_software_statement'), // Don't use this public one in production unless implicit flow is OK for you
    redirect: require('./dev-cert/unsigned_software_statement').redirect_uris[process.env.NODE_ENV === 'production' ? 1 : 0], // 0 is localhost:3000, 1 is trellisfw.github.io/conductor
  },
  skin: 'default', // which of the skins is the default one
  skins: {
    default: {}, // filled out from skin-specific config below
    smithfield: {},
  },
};

// Load the skin configs:
_.each(config.skins, (v,k) => {
  config.skins[k] = require('../../public/skins/'+k+'/config.js');
});

export default config;
