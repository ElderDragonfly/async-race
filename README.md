# Async Race

TypeScript single-page racing application built as a frontend training project.

The app allows users to manage a garage of cars, start races, animate cars on the track, save winners, and view a winners leaderboard.

The project uses a local mock REST API server provided by the Async Race task. The frontend and server are placed in separate folders and can be started together from the project root.

## Features

* Garage page with car list and pagination
* Create, update, and remove cars
* Generate random cars
* Start and stop individual car engines
* Start a race for all cars on the current page
* Animate car movement using `requestAnimationFrame`
* Detect and save the race winner
* Display winner popup
* Winners leaderboard
* Winners pagination
* Winners sorting by wins and best time
* Integration with a local REST API

## Tech Stack

### Frontend

* TypeScript
* Webpack
* Sass
* HTML
* DOM API
* REST API

### Local API

* Node.js
* json-server
* Mock API from the Async Race task

## Project Structure

```text
async-race/
  client/      # frontend application
  server/      # local mock API server
  package.json # root scripts for running client and server together
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ElderDragonfly/async-race.git
cd async-race
```

### 2. Install dependencies

Install root dependencies:

```bash
npm install
```

Install client dependencies:

```bash
npm --prefix client install
```

Install server dependencies:

```bash
npm --prefix server install
```

### 3. Run the project

Start both client and local API server from the root directory:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:8080
```

The local API server will run at:

```text
http://localhost:3000
```

## Available Scripts

From the root directory:

```bash
npm run client
```

Starts the frontend development server.

```bash
npm run server
```

Starts the local mock API server.

```bash
npm run dev
```

Starts both frontend and local API server together.

## Notes

This project was created as part of frontend training.

The main focus of the project is frontend logic: TypeScript architecture, DOM rendering, API interaction, asynchronous race flow, animation control, and UI state management.

The backend is a local mock API used for the task and is included only to make the project easy to run locally.
