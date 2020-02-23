module.exports = {
  "redirect_uris": [
    "http://localhost:3000/oauth2/redirect.html",
    "https://trellisfw.github.io/rulesApp/oauth2/redirect.html",
  ],
  "token_endpoint_auth_method": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
  "grant_types": [
    "authorization_code"
  ],
  "response_types": [
    "token",
    "code",
    "id_token",
    "id_token token",
    "code id_token",
    "code token",
    "code id_token token"
  ],
  "client_name": "Trellis - Open Source",
  "client_uri": "https://github.com/trellisfw",
  "contacts": [
    "Aaron Ault <aultac@purdue.edu>"
  ],
  // THERE IS NOTHING PRIVATE ABOUT THIS DEV CERT: IT IS IN GITHUB.  OVERRIDE WITH YOUR OWN FOR PRODUCTION
  "jwks": {
    "keys": [
      {
        "kty":"RSA",
        "n":"75h2Mbrh27qpQyvdbBkPy5My-6Zue_fhmKc9TVdpvvVJZKWz0TfZE-JSJKxxMxIzDv6PQoEZRvBzbaTie3-NQxF63cIZmkcQKl8gGeuPaB9aH_EUiP__ySIoVHT0BgW24-iMm-mdKvsBi09NryVsash8ZEir4GjE-TSi-QKnvAoBBKQPj2znzQQz9X_QEsg4wG_XoZSmn5hbTs485ck8SkjBY8ovc6Mx9oH6GHfUrLOIv7oyZTiLCKjwIuTaQYUg018hoI76oN_E4NzKX2VF3rHmqw3FNc4gUR0fKdCWK64hgYeNvXMVlq9OjZpHR8uIWbX7FZCKlbYv1TNGJBe5mQ",
        "e":"AQAB","kid":"a9ef7d877f7f4e58bd7dbb5414478730"
      }
    ]
  }
}
