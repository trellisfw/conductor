import config from '../../config'
export default {
  name: '',
  email: config.login.autofill ? config.login.autofill.email : '',
  password: config.login.autofill ? config.login.autofill.password : '',
}
