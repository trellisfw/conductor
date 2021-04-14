import _ from 'lodash'
import Fuse from 'fuse.js'
import moment from 'moment'

//let DOC_TYPES = [ 'documents', 'cois', 'fsqa-audits', 'fsqa-certificates', 'letters-of-guarantee'];

export default {
  tp: 'Smithfield',
  Pages: {
    lastSelectedPage: null,
    selectedPage: ({}, state) => {
      let selectedPage = state.view.Pages.lastSelectedPage;
      if (selectedPage == null) {
        //Pick first page that we have data for and access to
        const pages = [
          {
            type: 'documents',
            page: 'Data',
            showIfEmpty: true
          },
          {
            type: 'cois',
            page: 'COIS'
          },
          {
            type: 'fsqa-audits',
            page: 'Audits'
          },
          {
            type: 'fsqa-certificates',
            page: 'Certificates'
          },
          {
            type: 'letters-of-guarantee',
            page: 'LettersOfGuarantee'
          },
        ];
        _.forEach(pages, (page) => {
          if (_.get(state.app.config, `tabs.${page.type}`) == true) {
            if (page.showIfEmpty || !_.isEmpty(_.get(state.oada.data, page.type))) {
              selectedPage = page.page;
              return false;
            }
          }
        })
      }
      return selectedPage;
    },
    Documents: {

    },
    Reports: {
      startDate: '',
      endDate: '',
      allSelected: false,
      selectedReport: 'eventLog',
      eventLog: {
        Table: ({}, state) => {
          const myState = _.get(state, `oada.data.Reports.eventLog`);
          const keys = _.keys(myState).sort().reverse();
          const startDate = moment(state.view.Pages.Reports.startDate, 'YYYY-MM-DD');
          const endDate = moment(state.view.Pages.Reports.endDate, 'YYYY-MM-DD');
          const valid = keys.map((key) => {
            return moment(key, 'YYYY-MM-DD');
          }).filter((date) => date.isValid()).filter((reportDate) => {
            const isAfter = !startDate.isValid()
              ? true
              : reportDate.isSameOrAfter(startDate)
            const isBefore = !endDate.isValid()
              ? true
              : reportDate.isSameOrBefore(endDate)
            return isBefore && isAfter;
          }).map((reportDate) => {
            return reportDate.format('YYYY-MM-DD');
          });

          return valid.map((documentKey) => {
            if (!myState[documentKey].data) {
              return { documentKey };
            }
            try {
              return {
                checked: myState[documentKey].checked,
                documentKey,
                numDocuments: myState[documentKey].data.numDocuments,
                numEvents: myState[documentKey].data.numEvents,
                numEmails: myState[documentKey].data.numEmails,
                numShares: myState[documentKey].data.numShares,
              };
            } catch (e) {
              return {
                documentKey,
              };
            }
          });
        }
      },

      userAccess: {
        Table: ({}, state) => {
          // Why is `state.oada.data.Reports` undefinded if I don't use lodash?
          const myState = _.get(state, `oada.data.Reports.userAccess`);
          const keys = _.keys(myState).sort().reverse();
          const startDate = moment(state.view.Pages.Reports.startDate, 'YYYY-MM-DD');
          const endDate = moment(state.view.Pages.Reports.endDate, 'YYYY-MM-DD');
          const valid = keys.map((key) => {
            return moment(key, 'YYYY-MM-DD');
          }).filter((date) => date.isValid()).filter((reportDate) => {
            const isAfter = !startDate.isValid()
              ? true
              : reportDate.isSameOrAfter(startDate)
            const isBefore = !endDate.isValid()
              ? true
              : reportDate.isSameOrBefore(endDate)
            return isBefore && isAfter;
          }).map((date) => {
            return date.format('YYYY-MM-DD');
          });

          return valid.map((documentKey) => {
            if (!myState[documentKey].data) {
              return { documentKey };
            }
            try {
              return {
                checked: myState[documentKey].checked,
                documentKey,
                numTradingPartners: myState[documentKey].data.numTradingPartners,
                numTPWODocs: myState[documentKey].data.numTPWODocs,
                totalShares: myState[documentKey].data.totalShares,
              };
            } catch (e) {
              return {
                documentKey,
              };
            }
          });
        }
      },

      documentShares: {
        Table: ({}, state) => {
          // Why is `state.oada.data.Reports` undefinded if I don't use lodash?
          const myState = _.get(state, `oada.data.Reports.documentShares`);
          const keys = _.keys(myState).sort().reverse();
          const startDate = moment(state.view.Pages.Reports.startDate, 'YYYY-MM-DD');
          const endDate = moment(state.view.Pages.Reports.endDate, 'YYYY-MM-DD');
          const valid = keys.map((key) => {
            return moment(key, 'YYYY-MM-DD');
          }).filter((date) => date.isValid()).filter((reportDate) => {
            const isAfter = !startDate.isValid()
              ? true
              : reportDate.isSameOrAfter(startDate)
            const isBefore = !endDate.isValid()
              ? true
              : reportDate.isSameOrBefore(endDate)
            return isBefore && isAfter;
          }).map((date) => {
            return date.format('YYYY-MM-DD');
          });

          return valid.map((documentKey) => {
            if (!myState[documentKey].data) {
              return { documentKey };
            }
            try {
              return {
                checked: myState[documentKey].checked,
                documentKey,
                numDocsToShare: myState[documentKey].data.numDocsToShare,
                numExpiredDocuments: myState[documentKey].data.numExpiredDocuments,
                numDocsNotShared: myState[documentKey].data.numDocsNotShared,
              };
            } catch (e) {
              return {
                documentKey,
              };
            }
          });
        }
      }
    },

    Audits: {
      search: '',
      openFileBrowser: false,
      Table: ({search}, state) => {
        let unloadedDocs = [];
        const documents = _.get(state, `oada.data.fsqa-audits`);
        const docKeys = _.keys(documents).sort().reverse();
        const now = moment()
        let collection = _.map(docKeys,
          (documentKey) => {
            const document = documents[documentKey];
            if (!document) {
              unloadedDocs.push({documentKey})
              return {documentKey};
            }
            let createdAt = moment.utc(_.get(document, '_meta.stats.created'), 'X')
            if (createdAt.isValid()) {
              createdAt = createdAt.local().format('M/DD/YYYY h:mm a');
            } else {
              createdAt = '';
            }

            let shares = _.chain(document).get('_meta.services.trellis-shares.share-count').value();
            if (shares == null) shares = _.chain(document).get('_meta.services.trellis-shares.jobs').keys().value().length;

            return {
              documentKey: documentKey,
              docType: 'fsqa-audits',
              filename: _.get(document, 'organization.name') || '',
              type: 'FSQA Audit',
              shares,
              score: _.get(document, 'score.final'),
              validity: _.get(document, 'certificate_validity_period'),
              createdAt,
              createdAtUnix: _.get(document, '_meta.stats.created')
            }
          }
        )
        //Filter collection by filename
        const fuseOptions = {keys: [{name: 'filename', weight: 0.3}], shouldSort: false};
        var fuse = new Fuse(collection, fuseOptions);
        if (search && search.length > 0) {
          collection = _.map(fuse.search(search.substr(0, 32)), 'item');
          //Add back in unloaded docs at the end
          collection = _.concat(collection, unloadedDocs);
        }
        return collection;
      }
    },
    COIS: {
      search: '',
      openFileBrowser: false,
      Table: ({search}, state) => {
        let unloadedDocs = [];
        const documents = _.get(state, `oada.data.cois`);
        const docKeys = _.keys(documents).sort().reverse();
        let collection = _.map(docKeys,
          (documentKey) => {
            const document = documents[documentKey];
            if (!document) {
              unloadedDocs.push({documentKey})
              return {documentKey};
            }
            let createdAt = moment.utc(_.get(document, '_meta.stats.created'), 'X')
            if (createdAt.isValid()) {
              createdAt = createdAt.local().format('M/DD/YYYY h:mm a');
            } else {
              createdAt = '';
            }
            return {
              documentKey: documentKey,
              docType: 'cois',
              holder: _.get(document, 'holder.name') || '',
              producer: _.get(document, 'producer.name') || '',
              insured: _.get(document, 'insured.name') || '',
              signed: (_.get(document, 'signatures') || []).length > 0,
              type: 'COI',
              createdAt,
              createdAtUnix: _.get(document, '_meta.stats.created'),
              processingService: 'target'
            }
          }
        )
        //Filter collection by filename
        const fuseOptions = {keys: [{name: 'holder', weight: 0.3}], shouldSort: false};
        var fuse = new Fuse(collection, fuseOptions);
        if (search && search.length > 0) {
          collection = _.map(fuse.search(search.substr(0, 32)), 'item');
          //Add back in unloaded docs at the end
          collection = _.concat(collection, unloadedDocs);
        }
        return collection;
      }
    },
    Certificates: {
      search: '',
      openFileBrowser: false,
      Table: ({search}, state) => {
        let unloadedDocs = [];
        const documents = _.get(state, `oada.data.fsqa-certificates`);
        const docKeys = _.keys(documents).sort().reverse();
        let collection = _.map(docKeys,
          (documentKey) => {
            const document = documents[documentKey];
            if (!document) {
              unloadedDocs.push({documentKey})
              return {documentKey};
            }
            let createdAt = moment.utc(_.get(document, '_meta.stats.created'), 'X')
            if (createdAt.isValid()) {
              createdAt = createdAt.local().format('M/DD/YYYY h:mm a');
            } else {
              createdAt = '';
            }
            let org_location = `${_.get(document, 'organization.location.street_address')} - ${_.get(document, 'organization.location.city')}, ${_.get(document, 'organization.location.state')}`
            return {
              documentKey: documentKey,
              docType: 'fsqa-certificates',
              organization: _.get(document, 'organization.name') || '',
              org_location: org_location || '',
              signed: (_.get(document, 'signatures') || []).length > 0,
              type: 'COI',
              createdAt,
              createdAtUnix: _.get(document, '_meta.stats.created'),
              processingService: 'target'
            }
          }
        )
        //Filter collection by filename
        const fuseOptions = {keys: [{name: 'organization', weight: 0.3}], shouldSort: false};
        var fuse = new Fuse(collection, fuseOptions);
        if (search && search.length > 0) {
          collection = _.map(fuse.search(search.substr(0, 32)), 'item');
          //Add back in unloaded docs at the end
          collection = _.concat(collection, unloadedDocs);
        }
        return collection;
      }
    },
    Data: {
      search: '',
      openFileBrowser: false,
      uploading: {},
      Table: ({search}, state) => {
        let unloadedDocs = [];
        const documents = _.get(state, `oada.data.documents`);
        const docKeys = _.keys(documents).sort().reverse();
        let collection = _.map(docKeys,
          (documentKey) => {
            const document = documents[documentKey];
            if (!document) {
              unloadedDocs.push({documentKey})
              return {documentKey};
            }
            //Filter out docs with vdoc in meta, don't show them
            if (_.get(document, '_meta.vdoc') != null) {
              return null;
            }
            //Pull out status from target
            const tasks = _.get(document, '_meta.services.target.jobs') || {}
            const fileDetails = {
              type: _.get(document, '_meta._type') || ''
            }

            // Check if Target service exists and is handling this document:
            const processingService = _.keys(tasks).length > 0 ? 'target' : false


            let createdAt = moment.utc(_.get(document, '_meta.stats.created'), 'X')
            if (createdAt.isValid()) {
              createdAt = createdAt.local().format('M/DD/YYYY h:mm a');
            } else {
              createdAt = '';
            }

            return {
              documentKey: documentKey,
              docType: 'documents',
              filename: _.get(document, '_meta.filename') || '',
              type: fileDetails.type,
              createdAt,
              createdAtUnix: _.get(document, '_meta.stats.created'),
              processingService
            }
          }
        )
        collection = _.compact(collection); // Remove null docs, ones that have a vdoc
        //Filter collection by filename
        const fuseOptions = {keys: [{name: 'filename', weight: 0.3}], shouldSort: false};
        var fuse = new Fuse(collection, fuseOptions);
        if (search && search.length > 0) {
          collection = _.map(fuse.search(search.substr(0, 32)), 'item');
          //Add back in unloaded docs at the end
          collection = _.concat(collection, unloadedDocs);
        }
        _.forEach(_.get(state, 'view.Pages.Data.uploading'), file => {
          collection.unshift({
            filename: file.filename,
            status: 'uploading'
          })
        })
        return collection;
      }
    },
    Rules: {
    }
  },
  Modals: {
    EditRuleModal: {
      open: false,
    },
    RulesModal: {
      open: false,
      page: 'List',
      List: {
        category: 'FSQA',
        categories: ['FSQA','PII','Claims','Sustainability','Supply Chain'],
      },
      Edit: {
        template: {},
        rule: {},
      },
    },
    FileDetailsModal: {
      open: false,
      documentKey: null,
      docType: null,
      showData: false,
      document: ({ documentKey, docType }, state) => {
        //Get the document
        return (
          _.chain(state)
            .get(`oada.data.${docType}.${documentKey}`)
            .value() || {}
        )
      },
      type: ({ document }, state) => {
        if (document._type == 'application/vnd.trellisfw.coi.accord.1+json' || document._type == 'application/vnd.trellisfw.coi.accord+json') { //application/vnd.trellisfw.coi.1+json
          return 'coi'
        } else if (document._type == 'application/vnd.trellisfw.fsqa-audit.sqfi.1+json' || document._type == 'application/vnd.trellisfw.audit.sqfi.1+json') {
          return 'audit'
        } else if (document._type == 'application/vnd.trellisfw.fsqa-certificate.sqfi.1+json' || document._type == 'application/vnd.trellisfw.certificate.sqfi.1+json') {
          return 'certificate'
        } else {
          return null;
        }
      },
      share: ({ document }, state) => {
        return (
          _.chain(document)
            .get(`_meta.services.approval.tasks`)
            .value() || {}
        )
      },
      sharedSearchValue: '',
      sharedWith: [],
      sharedWithFiltered: ({sharedWith: collection, sharedSearchValue: search}, state) => {
        if (search.length == 0) return collection;
        //Filter collection by sharedSearchValue
        const fuseOptions = {keys: [{name: 'with', weight: 0.8}], shouldSort: true};
        var fuse = new Fuse(collection, fuseOptions);
        if (search && search.length > 0) {
          collection = _.map(fuse.search(search.substr(0, 32)), 'item');
        }
        if (collection.length == 0) {
          return [{type: '', with: 'No Results Found'}]
        }
        return collection;
      }
    },
    PDFViewerModal: {
      open: false
    }
  }
}
