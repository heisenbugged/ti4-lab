# TI4 Lab

TI4 lab is a Twilight Imperium 4 drafting and map building tool. It supports multiple draft formats, has browser notifications, discord integration, and many other fun things.

## Prerequisites

### Dependencies

- Node.js
- Sqlite3

### Environment setup

In your shell configuration, add the following

```
export TI4_LAB_DATABASE_PATH="file:///ABSOLUTE_PATH_HERE"
```

_NOTE_: The path must be an absolute path.

## Installing / running

Assuming all the prerequisites are met, you can run the following commands to install and run the app:

```shell
npm install --global yarn
yarn install
yarn run dev
```

Open `https://localhost:3000/` in your browser and you're good to go.
