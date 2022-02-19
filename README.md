# Bitburner Sync

This package allows code to be synced to the game from any environment. It's inspired by
the [VSCode extension](https://github.com/bitburner-official/bitburner-vscode) but allows for greater freedom since it's
not tied to a specific IDE. The only requirement is [Node.js®](https://nodejs.org).

NB: You must play the game via the Electron client (the Steam version) to be able to sync code.

## Install

Install in your project via `npm install bitburner-sync`. It can be installed as a global tool  but it then looses the ability to be configured in package.json.

## Usage

Can be used from the terminal. Use `bitburner-sync -help` for full information.

| Option     | Description                                                                                                                                                                                                                                  |
|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| authToken  | The only required option, it can also be read from package.json. See the [VSCode extension](https://github.com/bitburner-official/bitburner-vscode) for information about how to retrieve it.                                                |
| scriptRoot | The folder that you want to sync. Defaults to the current folder. The directory node_modules is ignored but any other valid game files are synced. It's highly recommended to do a dryRun first to list all the files that would be synced.  |
| dryRun     | Doesn't sync the files, simply lists them in the terminal.                                                                                                                                                                                   |
| watch      | Continuously monitor the scriptRoot for changes                                                                                                                                                                                              |
| help       | Displays the full help                                                                                                                                                                                                                       |

### package.json

It's recommended to be configured as a script that can then be invoked via `npm run sync` or similar.

```json
"scripts": {
  "sync": "bitburner-sync --watch"
}
```

Optional config

````json
"config": {
  "bitburnerAuthToken": "abc",
  "bitburnerScriptRoot": "./dist"
}
````

## Bitburner

> Bitburner is a programming-based incremental game. Write scripts in JavaScript to automate gameplay, learn skills, play minigames, solve puzzles, and more in this cyberpunk text-based incremental RPG.

### Relevant Links

The game can be played via Steam or via the Web with any browser that supports and has Javascript enabled. The discord
is the place to go for information, help, to raise bugs or talk/help contribute features to the game!

- [Steam Page](https://store.steampowered.com/app/1812820/Bitburner/)
- [Web Version](https://danielyxie.github.io/bitburner/)
- [Game Discord](https://discord.gg/TFc3hKD)
- [Github](https://github.com/danielyxie/bitburner/)
