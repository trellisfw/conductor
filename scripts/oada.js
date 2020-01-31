var _ = require('lodash');
var Promise = require('bluebird');
var request = require('axios');

var state = {
  oada: {
    url: 'https://localhost',
    token: 'def'
  }
}

function postHTTP({url, headers, data}) {
  return request.request({
    url: url,
    method: 'post',
    baseURL: state.oada.url,
    headers: _.merge({
      Authorization: 'Bearer '+state.oada.token
    }, headers),
    data: data
  })
}

function putHTTP({url, headers, data}) {
  return request.request({
    url: url,
    method: 'put',
    baseURL: state.oada.url,
    headers: _.merge({
      Authorization: 'Bearer '+state.oada.token
    }, headers),
    data: data
  })
}

function createResourceHTTP({data, contentType}) {
  var headers = {};
  headers['content-type'] = contentType || 'application/json';
  return postHTTP({url: '/resources', data, headers})
}

function createAndPostResourceHTTP({url, data, contentType}) {
  return createResourceHTTP({data, contentType}).then((response) => {
    //Link this new resource at the url provided
    var id = response.headers['content-location'].split('/')
    id = id[id.length-1]
    return postHTTP({
      url: url,
      headers: {
        'Content-Type': contentType || 'application/json'
      },
      data: {
        _id:'resources/'+id,
        _rev: 0
      }
    }).then((response) => {
      var id = response.headers['content-location'].split('/')
      id = id[id.length-1]
      return id;
    })
  })
}
function createAndPutResourceHTTP({url, data, contentType}) {
  return createResourceHTTP({data, contentType}).then((response) => {
    //Link this new resource at the url provided
    var id = response.headers['content-location'].split('/')
    id = id[id.length-1]
    return putHTTP({
      url,
      headers: {
        'Content-Type': contentType || 'application/json'
      },
      data: {
        _id:'resources/'+id,
        _rev: 0
      }
    });
  })
}


const audit = {
  "_id": "resources/b01b773c-e9de-4242-86e8-8ca5ebff06b2",
  "_rev": 2,
  "_type": "application/vnd.trellisfw.audit.sqfi.1+json",
  "_meta": {
    "_id": "resources/b01b773c-e9de-4242-86e8-8ca5ebff06b2/_meta",
    "_rev": 2
  },
  "certificationid": {
    "id_source": "certifying_body",
    "id": "107139"
  },
  "auditid": {
    "id_source": "certifying_body",
    "id": "56287"
  },
  "scheme": {
    "name": "SQFI",
    "edition": "8.0",
    "audit_reference_number": "56287"
  },
  "certifying_body": {
    "name": "Mrieux NutriSciences Certification",
    "auditors": [
      {
        "FName": "Lee",
        "LName": "Degner",
        "PersonNum": "9438",
        "Role": "Lead Auditor"
      }
    ]
  },
  "organization": {
    "organizationid": {
      "id_source": "certifying_body",
      "id": "10138"
    },
    "GLN": "Undefined",
    "name": "Smithfield Packaged Meats Corp. - Arnold",
    "companyid": "10138",
    "contacts": [
      {
        "name": ""
      }
    ],
    "location": {
      "street_address": "2200 Rivers Edge Drive",
      "postal_code": "15068",
      "city": "Arnold",
      "state": "PA",
      "country": "United States"
    },
    "phone": ""
  },
  "scope": {
    "description": "beef, chicken, meatballs, pork, sausage, turkey",
    "operation": {
      "operation_type": "",
      "operator": {
        "contacts": [
          {
            "name": ""
          }
        ],
        "name": ""
      },
      "shipper": {
        "name": ""
      },
      "location": {
        "address": "",
        "city": "",
        "state": "",
        "postal_code": "",
        "country": ""
      }
    },
    "products_observed": []
  },
  "conditions_during_audit": {
    "operation_observed_date": {
      "start": "2018-03-20T00:00:00",
      "end": "2018-03-23T00:00:00"
    }
  },
  "score": {
    "final": {
      "value": "98",
      "units": "%"
    },
    "rating": "Excellent"
  },
  "certificate_validity_period": {
    "start": "6/5/2019",
    "end": "1/15/2018"
  },
  "signatures": [
    "eyJraWQiOiJ0cmVsbGlzZnctc2lnbmVyIiwiYWxnIjoiUlMyNTYiLCJrdHkiOiJSU0EiLCJ0eXAiOiJKV1QiLCJqa3UiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vdHJlbGxpc2Z3L3RydXN0ZWQtbGlzdC9tYXN0ZXIvamt1LXRlc3Qvc29tZS1vdGhlci1qa3Utbm90LXRydXN0ZWQuanNvbiIsImlhdCI6MTU4MDQwNDA5NX0.eyJoYXNoIjoiMDNmYTBmOWM2OGU5NzlhZTIzZDMxYjk2MzdlODI0ZmRkNWUwNWZkODkyNDE0MDQ5NjJkOWQ2MjUzNjAwOWNlNCJ9.Ti1LPIlOQH-f3LoIuLG8hZgwr2EcjO8FpkGk5-vFg0flsR9wMH2-9AqZVPMyTvqP54JAb-umQJPzsfOTj314QcpG9fjchH9x4UjYgYo51kwTKmga97nt8twabcgD1YbySuD-bAblpe8yMS5MU1U4OnsA-P8qzoD2X-ZM43mdV8Q--Y4Ke41DX2GHjf9TP_6xOaK-1QHXbBYHWmEyVkxz6r3uqtEPEgwmMho1UgJmYaYDbk64e6e4eha99ilDAjV7i0qS6CKbYifEHmSzdbzeB3hTH6RZBfAVTiSFuznbfvfTgb7CqPAFbzYjh70rHxFAlbmjJB5hzgH_ag862au_Cw"
  ]
}

const coi = {
  "_id": "resources/1bac05f2-566b-46dd-946a-29fe05ebae71",
  "_rev": 1,
  "_type": "application/vnd.trellisfw.coi.accord+json",
  "_meta": {
    "_id": "resources/1bac05f2-566b-46dd-946a-29fe05ebae71/_meta",
    "_rev": 1
  },
  "certificate": {
    "certnum": "CLE-005862780-24",
    "rev": "2",
    "docdate": "1900-12-30T00:00:00",
    "operate_desc": " TYSON FOODS AND ITS MAJORITY OWNED SUBSIDIARIES ARE INCLUDED AS ADDITIONAL INSURED (EXCEPT WORKERS COMPENSATION) WHERE REQUIRED BY WRITTEN CONTRACT.",
    "file_name": "1ef32f54-f5c5-47b1-9224-337f7dbfd122.pdf"
  },
  "producer": {
    "name": "Marsh USA Inc.",
    "location": {
      "street_address": "1717 Arch Street",
      "postal_code": "19103",
      "city": "Philadelphia",
      "state": "PA",
      "country": ""
    }
  },
  "insured": {
    "name": "Smithfield Foods, Inc.",
    "location": {
      "street_address": "200 Commerce Street",
      "postal_code": "23430",
      "city": "Smithfield",
      "state": "VA",
      "country": ""
    }
  },
  "holder": {
    "name": "TYSON FOODS AND ITS MAJORITY OWNED SUBSIDIARIES",
    "location": {
      "street_address": "MAIL CODE CP355 PO BOX 2020",
      "postal_code": "72762",
      "city": "SPRINGDALE",
      "state": "AR",
      "country": ""
    }
  },
  "policies": {
    "MWZY312999 19": {
      "number": "MWZY312999 19",
      "effective_date": "2019-04-30T00:00:00",
      "expire_date": "2020-04-30T00:00:00"
    },
    "MWTB312998 19": {
      "number": "MWTB312998 19",
      "effective_date": "2019-04-30T00:00:00",
      "expire_date": "2020-04-30T00:00:00"
    },
    "US00067047LI19A": {
      "number": "US00067047LI19A",
      "effective_date": "2019-04-30T00:00:00",
      "expire_date": "2020-04-30T00:00:00"
    },
    "LDC4043811 (AOS)": {
      "number": "LDC4043811 (AOS)",
      "effective_date": "2019-04-30T00:00:00",
      "expire_date": "2020-04-30T00:00:00"
    },
    "PS4043812 (WI)": {
      "number": "PS4043812 (WI)",
      "effective_date": "2019-04-30T00:00:00",
      "expire_date": "2020-04-30T00:00:00"
    }
  }
};

return createAndPostResourceHTTP({
  url: '/bookmarks/trellisfw/documents/55770dd0-c661-4a8b-93de-c3a12628843c/cois',
  data: coi
})
