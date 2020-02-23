const config = {
  oada: {
//    url: 'https://smithfield.trellis.one',
    url: 'https://localhost',
    devcert: require('./dev-cert/signed_software_statement'), // Don't use this public one in production unless implicit flow is OK for you
    redirect: require('./dev-cert/unsigned_software_statement').redirect_uris[0], // 0 is localhost:3000, 1 is trellisfw.github.io/rulesApp
  },
  skin: {
    name: 'default', //'smithfield',
  },
};

// Load the skin config:
config.skin.config = require('../../public/skins/'+config.skin.name+'/config.js');

export default config;
