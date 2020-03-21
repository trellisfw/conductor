module.exports = {
  "redirect_uris": [
    "http://localhost:3000/oauth2/redirect.html",
    "https://trellisfw.github.io/conductor/oauth2/redirect.html",
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
      {"kty":"RSA","n":"vww1Kr3HU950pJL8Nyxt1VY7FHe3zxzRgUkdMnt3BS6FgxypvWGoXMa9PZXPw1_xbQW5pWIUOudmJzMLFtY39kQQbIoVt1uY_ItB46gk523KAQVKbC4-TX2OnVHdI-k0cQeNfHjItsDcdN-PXJVS-70D0Ya0D3WyiTHOhsdYzWBmbaEpl5DnDkcGBn08EpLw1eYa8z9qHte4MVsMcs2iv7fx6tM2fmPe4PyYAxeRXSDS1WJrwQyK9JrG1P_AQu_LECeziJteY6EVuiW3lb5X8Y9oq3qp5exJCVYRvssQUw5N-Wv8D5Iiy7A6bL-HJP1_9by98RY8x-XbK4z_ELR3MQ","e":"AQAB","kid":"94aabb3aa1914ec8a8cda455a473cf0d"}
    ]
  }
}
