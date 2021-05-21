import _ from 'lodash';

const config = {
  oada: {
    url: 'https://stage.smithfield.trellis.one',
    devcert: require('./dev-cert/signed_software_statement'), // Don't use this public one in production unless implicit flow is OK for you
    redirect: require('./dev-cert/unsigned_software_statement').redirect_uris[process.env.NODE_ENV === 'production' ? 1 : 0], // 0 is localhost:3000, 1 is trellisfw.github.io/conductor
  },
  skin: 'default', // which of the skins is the default one
  skins: {
    default: {}, // filled out from skin-specific config below
    smithfield: {},
  },
  foodlogiq: {
    sf_bus_id: '5acf7c2cfd7fa00001ce518d',
    fl_host: 'https://sandbox-api.foodlogiq.com',
    fl_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2Zvb2Rsb2dpcS5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NWRmNTQxMDk4YmExNmIwZGExZjBjNmE4IiwiYXVkIjoiQnpzY0I5NXVGVTlSdkFGQzFGM0I0eFVVSWtiV0NSTmgiLCJpYXQiOjE1NzYzNjcyMzQsImV4cCI6MTU3NjM2NzUzNH0.tcWWHxyKlKlv7FNm1nferzTe6BgwiXY4ZgYSZv9z_wg',
  }
};

// Load the skin configs:
_.each(config.skins, (v,k) => {
  config.skins[k] = require('../../public/skins/'+k+'/config.js');
});

export default config;
