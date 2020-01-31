# Smithfield UI

This is the UI for the Smithfield SOW1 Demo.


## Configuration

- Configure the trellis URL at `/src/overmind/oada/state.js`
- Configure trellis tokens and login info at `/src/overmind/login/actions.js`
	- `hashes` key is sha256 of `<salt>+<email>+<password>` for user creds and configures which token to use after logging in.

## Building

Currently do to a bug with the  `react-pdf` package you cannot build a production build. It will run your computer out of memory even if you increase node memory limit. We need to change to a pre-bundled copy of `react-pdf `.

## Scripts

For your convenience there are two useful scripts in the `/scripts` directory. `deleteAllDocs.js` deletes all the documents under `/bookmarks/trellisfw/documents` for token `god`, and `deleteAllDocsWakefern` deletes them all for token `aaa`. In both cases you **HAVE TO CONFIGURE THE URL** it is currently set to `https://smithfield.trellis.one`.
