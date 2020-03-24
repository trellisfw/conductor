# Trellis Conductor

This is the UI for managing the Trellis conductor service

## Configuration

- All configuration is done at `/src/config`
- You can add your own "skins" to the public/skins folder, then update the config to choose yours by default.

## Building
```bash
yarn
yarn run start
```

### [Demo SOW1 - 01/31/2020](docs/Demos/DEMO_01_31_2020.md)

### [TODO List](TODO.md)


## Scripts

For your convenience there is a `deleteAllDocs.js` script which deletes all the documents under `/bookmarks/trellisfw/documents` for token `god` on `localhost`, you can specify different token or host using `TOKEN` and `URL` command line parameters.
