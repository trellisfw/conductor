const IS_DEV = process.env.NODE_ENV == 'development';

export default {
  name: '',
  email: IS_DEV ? 'michael@smithfield.com' : '',
  password: IS_DEV ? 'password' : ''
}
