# Open Arcade
A 2D arcade-style open world game concept.
Open Arcade is a Chrome dev tools extension, which allows your avatar to explore environments that are dynamically generated as you browse the internet.

## Running the game
### Served via dev server
Install Node on your computer and clone this repository, then run:

```
npm install
```

To run Open Arcade locally in your web browser i.e. not as a Chrome dev tools extension (easier if your developing), run:

```
npm start
```

Open Arcade should open inside your browser served from localhost on port 3000.
When running Open Arcade directly in the browser it depends on a data fixture in order to generate the game environment.

### As a local Chrome extension
Sometimes you just need to test or debug something whilst Open Arcade is running as a dev tools extension. To get setup do the following:

Run:

```
npm run deploy
```

This generates everything Chrome needs to unpack the extension inside of the dist folder.

- In Chrome go to chrome://extensions and toggle Developer Mode to be on.
- Click Load Unpacked and select the dist folder

The extension should now be installed in your browser.
Open a new tab and open dev tools. There should be an additional tab named Open Arcade.

