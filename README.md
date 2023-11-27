# Trivial UI Example

This Vue app provides an example UI for [trivial-core](https://github.com/solid-adventure/trivial-core). Full documentation at [trivial-js.org](https://trivial-js.org).

## Installing & Building a demo app

### Prerequisites

#### Node.js

Lupin uses Node 18.17.0 and npm 9.8.1. You should install [nvm](https://github.com/nvm-sh/nvm) to manage Node versions:

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
```

Then install the correct version of Node:

```
nvm install 18.17.0
nvm use 18.17.0
```

And the required version of npm:

```
npm install npm@9.8.1 -g
```

## Setup

 1. Clone this repo into a location of your choice: `git clone git@github.com:solid-adventure/trivial-ui.git`
 2. Switch to the newly created directory: `cd trivial-ui`
 3. Make sure you are using the correct node version: `nvm use 18.17.0`
 4. Install node packages: `npm install`
 5. Create a new file named `.env` based on `.env.example`: `cp .env.example .env`
 6. Open the newly created `.env` with your text editor and change the value for `COOKIE_SIGNATURE` to a random string of your choice. If you are on a Mac, you can run `dd if=/dev/urandom bs=1 count=24 | base64 | pbcopy` on the command line to copy a random string to the clipboard.
 7. Save your changes to `.env`.
 8. Install gulp globally by running `npm install -g gulp`.
 9. Start the server by running `gulp`.
 10. Visit http://localhost:3000 and sign in with your credentials for the staging environment.
 11. To build a demo app, click the "New App" button after you log in.

## Registering New Users
By default, new user registration is disabled. Set the env var `ENABLE_REGISTRATION=TRUE` and restart the server to enable.

To create a one-off user without enabling registration, visit [http://localhost:3000/register?enableFeatures=registration](http://localhost:3000/register?enableFeatures=registration)

Note that this allows users to sign up to create their own apps. It does not allow them to see apps created by other users or share apps through a customer entity, which requires manual configuration.

## Starting the server
This will build the app, start the server, and restart when changes are detected.

```bash
gulp
```

Expected output:
```bash
> Using gulpfile /Library/WebServer/trivial-ui/gulpfile.js
> Starting 'default'...
> Starting 'start'...
> Starting 'build'...
> Starting 'staticFiles'...
> Finished 'staticFiles' after 117 ms
> Starting 'sassFiles'...
> Finished 'sassFiles' after 514 ms
> Starting 'actionRegistry'...
> Finished 'actionRegistry' after 9.77 ms
> Starting 'pack'...
> Finished 'pack' after 11 s
> Finished 'build' after 12 s
> Starting '<anonymous>'...
> [nodemon] 2.0.12
> [nodemon] to restart at any time, enter `rs`
> [nodemon] watching path(s): *.*
> [nodemon] watching extensions: js,html,scss,vue
> [nodemon] starting `node serve.js`
{"level":30,"time":1689097003907,"pid":12792,"msg":"Server running at http://localhost:3000/"}

```

## Running tests

```bash
npm test
>  55 passing (30ms)

```

