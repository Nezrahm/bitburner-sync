# Bitburner Sync

This package allows code to be synced to the game from any environment. It's inspired by
the [VSCode extension](https://github.com/bitburner-official/bitburner-vscode) but allows for greater freedom since it's
not tied to a specific IDE. The only requirement is [Node.js®](https://nodejs.org).

NB: You must play the game via the Electron client (aka the Steam version) to be able to sync code.

## Install

Install in your project via `npm install bitburner-sync`.

It can also be installed as a global tool via `npm install bitburner-sync -g`.

For more help around installation then look [here](https://github.com/Nezrahm/bitburner-sync/wiki/Installation)

## Usage

Can be used from the terminal, then always prefix the calls with `npx`. Use `npx bitburner-sync --help` for full information.

| Option      | Description                                                                                                                                                                                                                                 |
|-------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| authToken   | The only required option, it can also be read from package.json. See the installation instruction above or the [VSCode extension](https://github.com/bitburner-official/bitburner-vscode) for information about how to retrieve it.         |
| scriptRoot  | The folder that you want to sync. Defaults to the current folder. The directory node_modules is ignored but any other valid game files are synced. It's highly recommended to do a dryRun first to list all the files that would be synced. |
| serverUrl   | The API server (game client) to connect to (defaults to a local application, 127.0.0.1)                                                                                                                                                     |
| allowDelete | If the sync (upload and retrieve) should be allowed to delete files at the target                                                                                                                                                           |
| get         | Retrieve files from bitburner and store at scriptRoot                                                                                                                                                                                       |
| dryRun      | Doesn't sync the files, simply lists them in the terminal.                                                                                                                                                                                  |
| watch       | Continuously monitor the scriptRoot for changes.                                                                                                                                                                                            |
| help        | Displays the full help.                                                                                                                                                                                                                     |

### package.json

It's recommended to be configured as a script that can then be invoked via `npm run sync` or similar.

```json
{
  "scripts": {
    "sync": "bitburner-sync --watch"
  }
}
```

Optional config

```json
{
  "config": {
    "bitburnerAuthToken": "abc",
    "bitburnerScriptRoot": "./dist",
    "bitburnerAllowDelete": "false",
    "bitburnerServerUrl": "127.0.0.1"
  }
}
```

### bitburner-sync.json

This is another config file, if you prefer to have the config separate from the package.json file.

NB: The config inside package.json will override this config if both are specified.

```json
{
  "authToken": "abc",
  "scriptRoot": "./dist",
  "allowDelete": false,
  "serverUrl": "127.0.0.1"
} 
```

## Bitburner

> Bitburner is a programming-based incremental game. Write scripts in JavaScript to automate gameplay, learn skills, play minigames, solve puzzles, and more in this cyberpunk text-based incremental RPG.

### Relevant Links

The game can be played via Steam or via the Web with any browser that supports and has Javascript enabled. The discord
is the place to go for information, help, to raise bugs or talk/help contribute features to the game!

- [Steam Page](https://store.steampowered.com/app/1812820/Bitburner/)
- [Web Version](https://danielyxie.github.io/bitburner/)
- [Game Discord](https://discord.gg/TFc3hKD)
- [Github](https://github.com/danielyxie/bitburner/)
