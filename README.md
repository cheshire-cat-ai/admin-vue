# Cheshire Cat Admin UI 🐱

This is the source code to build the admin client for the Cheshire Cat AI.

## About the project

The Cheshire Cat is a framework to build long tail AIs:

- Language model agnostic, allows compatibility with OpenAI, Cohere, HuggingFace, and custom models
- Long term memory storage capabilities
- Seamless integration with external tools, such as APIs and other models
- Ability to ingest various document formats, including PDFs and text files
- 100% dockerized for simple and efficient deployment
- Extensibility via plugins, offering unparalleled flexibility to users.


### Pre-requisites

Make sure you have the following installed on your machine:

```bash
  node v18.15+
```

### Installation

Chose your preferred package manager and install the dependencies

```bash
  npm install
```

### Scripts

Here's a list of scripts that you can run to get the app up and running

#### Dev mode

Run the app in dev mode with hot-reloading enabled and the browser automatically opening on port `3000` (default)

```bash
  npm run dev
```

#### Build

Build the app for production

```bash
  npm run build
```

#### Start the app

Runs the build and serves the built app on port `3000` (default)

```bash
  npm run start
```
