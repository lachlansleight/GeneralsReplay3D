# generals.io Replay Utils

## Installation

```bash
$ npm install
```

## Usage

First, make sure you've read http://dev.generals.io/replays. That page will have a link to download a big archive of generals.io replays - go there to download it. Once you unzip the archive, you should have a bunch of `.gioreplay` files.

### Using the Simulator

`node simulator.js` runs a full game simulation on `example.gioreplay`. Modify it to fit your use case.

### Using the Converter

`node converter.js` converts the serialized file `input.gior` to the plaintext JSON `output.gioreplay`. Since replays are stored on the server in `.gior` format, this converter can be used to translate `.gior` files to `.gioreplay` files that the Simulator can use.

#### Support

Only Replay versions 5, 6, and 7 are supported. The only difference between versions 5 and 6 is city regeneration - see `Game.js` for more information. Version 7 adds a `map_title` field to the replay file - see `converter.js` for more information.
