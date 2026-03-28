# TI4 Lab

TI4 lab is a Twilight Imperium 4 drafting and map building tool. It supports multiple draft formats, has browser notifications, discord integration, and many other fun things.

## Prerequisites

### Dependencies

- Node.js
- Sqlite3

### Environment setup

## Database Path

In your shell configuration, add the following

```shell
export TI4_LAB_DATABASE_PATH="file:///ABSOLUTE_PATH_HERE.sqlite"
```

_NOTE_: The path must be an absolute path.

## Discord Token

TODO: some instructions on how to set up the Discord Bot Token would be nice

For local development without a discord token, set

```shell
export DISCORD_DISABLED=true
```

## Installing / running

Assuming all the prerequisites are met, you can run the following commands to install and run the app:

```shell
npm install --global yarn
yarn install
yarn run dev
```

Open `https://localhost:3000/` in your browser and you're good to go.
