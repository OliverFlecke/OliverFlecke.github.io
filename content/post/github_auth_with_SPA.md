---
title: Authenticate with Github on a Single-Page Application
date: 2021-08-11
draft: false
---

## Introduction

For a recent project, I wanted a way to authenticate users, but without all the struggle of managing users and their data.
This was for a frontend, single-page application (SPA) where everything could be served as static HTML/CSS/JS files.
My solution was to allow users to sign in with their Github credentials using OAuth.
This is the best of both worlds: I won't have to store any user data or think much about security, and users don't have to trust me with their email or password.

Github provide [some good documentation](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#web-application-flow) for how to perform this flow from inside a web browser, with one minor issue: [Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).
Because one of the calls to Github's API does not allow CORS, meaning you cannot call it from outside Github's domain, it is not possible to complete the OAuth flow entirely in the browser.
But [later](#getting-an-access-token) we will see a relative simple solution to get around this problem.

## TL;DR

Link to code: [proxy server](https://github.com/oliverflecke/github-oauth-proxy) and frontend application (to be added).

## The authentication flow

First of, an overview of the flow.

- Starting from our SPA, when the user clicks 'login', the browser redirects to `github.com/login/oauth/authorize`. This page will display Github's email/password prompt that external users should be familiar with.
- After the user has entered their credentials, the browser redirects back to our website, with a code that our website can exchange for an `access token`.
- Lastly, after having received the access token we can call Github's APIs!

Before getting started with coding, we have to register an OAuth application at Github.
Github [provides a good guide for creating an OAuth App](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app), but all you have to do is visit [https://github.com/settings/developers](https://github.com/settings/developers), click create and enter the app information.

The most important part is the `authorization callback url` (which can always be changed later), with is the url that the browser will redirect back to after a successful user login.
This also means, that even if others steal your client id and secret, they can redirect users to Github's website and make them login, but the user's browser will always be redirected back to the specified callback url.

Grab the client id and generate a client secret.
This secert should be kept, well, secret, and should therefore not be published with the client code or checked in to source control.
More on that later.

## Redirecting to Github to request a user's identity

First step of the process is to redirect the user to Github, which can be done with a simple link to the `authorize` endpoint.

```html
<a href="https://github.com/login/oauth/authorize?client_id=<your_client_id>&state=<generated_state>">
	Login
</a>
```

The `your_client_id` is the one we created in the previous step, and can safely be added here.
`generated_state` is an **unguessable random string** which is used to protect agains cross-site request forgery attacks.

There are [other paramters](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#parameters) that can be provided, such as the `redirect_url` but leaving this out will redirect the browser to the one we provided to Github when creating the OAuth application.
Another usefull one is the [scopes](https://docs.github.com/en/apps/building-oauth-apps/understanding-scopes-for-oauth-apps), which allow you to request access to different parts of Github's API.
However, as I'm only after getting the user's identity, we can leave this empty and it will only allow us to access public information.

## Getting an access token

After the user has logged in, the browser is redirected back to you site (by the provided callback url).
Passed as query parameters is a `code` and `state` value.
The `state` **must** be the same value as we provided when redirecting the user to Github in the first step - if not, we must abort the flow.
The `code` is prof of the user's identity, and can be exchanged within the next 10 minutes for an access token.

A simple way to get and check the `code` and `state` is to use [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams).
Passing it `window.location.search` will make it parse the query parameters and give you a simple object to retreive the values from.
Below is a code snippet to parse and verify that `code` and `state` is in the query string and that the `state` matches the expected state.

```js
const params = new URLSearchParams(window.location.search);
if (!params.has('code')) {
	return;
}

if (!params.has('state') || params.get('state') !== expectedState) {
	return;
}

const code = params.get('code');
```

Next we can exchange the `code` for an `access token`.
This is done by the following HTTP POST call, which can be done with JavaScript's `fetch`:

```js
fetch('https://github.com/login/oauth/access_token/', {
	method: 'POST',
	headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	},
	body: JSON.stringify({
		code,
		client_id,
		client_secret,
	}),
})
```

However, when running this inside a browser, we get an error.
Looking in the network tab we see:

![Screenshot of network tab in browser showing a CORS error](/media/github-auth-cors.png)

Github`s OAuth endpoints [does not currently support browser-only flows](https://github.com/isaacs/github/issues/330), as it is required to provide a client secret.
Secrets can inherently not be trusted if sent to the client, so we must proxy requests to the token endpoint through our own, trusted server.

Below is a small NodeJS server using [express](https://expressjs.com/) to provide an endpoint to which we can proxy our requests (the full source code can be found [on Github in this repository](https://github.com/oliverflecke/github-oauth-proxy)).

```js
const fetch = require('node-fetch');
const express = require('express');
const cors = require('cors');

require('dotenv').config();
const port = process.env.PORT || 80;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

const app = express();

app.use(cors({
	origin: 'https://example.com',
}));

const GITHUB_AUTH_ACCESSTOKEN_URL = 'https://github.com/login/oauth/access_token/';

app.post('/authorize', (req, res) => {
	const code = req.query.code;

	fetch(GITHUB_AUTH_ACCESSTOKEN_URL, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			client_id,
			client_secret,
			code,
		}),
	})
		.then(async (response) => {
			const json = await response.json();
			if ('error' in json) {
				res.status(400).send(json);
			} else {
				res.send(json);
			}
		})
		.catch(function (error) {
			console.error('Error ' + error.message);
			res.status(400).send(error.message);
		});
});

app.get('/', function (req, res) {
	res.send('OK');
});

app.listen(port, function () {
	console.log('Authorization proxy is running');
});
```

To run this, you will need to install a few dependencies:

```js
yarn add express cors dotenv node-fetch
```

### Rundown of the code

Below is a rundown of the server side code, if needed.

#### Configuring the server

The first few lines simply imports the libraries we need.
The first interisting part is using the `dotenv` package, which is used to read environment variables from a `.env` file (primarily used for running the app locally).
As we want to avoid hardcoding secrets into our source code, we can instead save them the `.env` file and read them when the application starts.
This also allows us to provide the values when running the app on a server.

```js
require('dotenv').config();
const port = process.env.PORT || 80;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
```

The `.env` file would look something like and be placed in the root of the project directory:

```sh
CLIENT_ID='<your_client_id>'
CLIENT_SECRET='<your_client_secret>'
PORT=8000
```

Next the app/server that should listen is created, along with adding support for CORS (which is the whole reason we are doing this).
Here you should provide the origin for your own website, which will make it sure it only works your domain.

```js
const app = express();

app.use(cors({
	origin: 'https://example.com',
}));
```

#### Proxying the request to Github

To listen for `POST` requests in express, call `app.post` and provide it with the url to listen at along with a callback to process the request.
In the code is added an endpoint at `/authorize` which we will use to proxy the request to Github.

```js
app.post('/authorize', (req, res) => {
	...
}
```

Inside the callback, a few things are going on.
First off, we pull the `code` out of request query

```js
	const code = req.query.code;
```

To match the browser as much as possible, I use `node-fetch` to perform exactly the same request as we did from the browser.
The code for calling Github's token endpoint therefore looks the same as it did in the browser.

```js
	fetch(GITHUB_AUTH_ACCESSTOKEN_URL, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			client_id,
			client_secret,
			code,
		}),
	})
```

Lastly, we have to send the respond from Github back to the caller.
When the fetch `Promise` resolves, we can read the json response, check if it contains an error, and otherwise just send it back to the caller (this is done with `res.send(json)`).
In case of an error in the response or if the fetch call itself fails, the error is also send back to the client.

```js
		.then(async (response) => {
			const json = await response.json();
			if ('error' in json) {
				res.status(400).send(json);
			} else {
				res.send(json);
			}
		})
		.catch(function (error) {
			console.error('Error ' + error.message);
			res.status(400).send(error.message);
		});
```

#### A small health check and starting the app

It is often usefull to have a health check endpoint to verify that the application is running and listening as expected.
The next few lines add this, by listening at the root `/` and always responding with `OK`.

```js
app.get('/', function (req, res) {
	res.send('OK');
});
```

Lastly, we start the application and make it listen to the provided `port`.

```js
app.listen(port, function () {
	console.log('Authorization proxy is running');
});
```

### Updating the client code to call the proxy

Now we are ready to use our proxy in our browser application.

```js
fetch(`${authCors}?code=${code}`, {
	method: 'post',
	headers: {
		Accept: 'application/json',
	},
})
	.then(async (res) => {
		if (res.status === 200) {
			const body = await res.json();
		}
		else {
			console.warn(`Got an unexpected status ${res.status}`);
		}
	}
```

Replace `authCors` with the URL to the proxy, and the code with the one we got from the callback from Github.
The `body` returned from the proxy will then look like:

```json
{
	"access_token": "FKBa0gzbI1...",
	"scopes": "<the scopes you have requested>",
	"token_type": "Bearer"
}
```

### Deployment

I like playing around with different tools and platforms to learn how they work and which options are out there.
For this project, I have deployed the proxy server using [heroku](https://www.heroku.com/).
At the time of writing, they allow you to create several lightweight application for you to test out.
Simply sign up for an account, create an app, and go to the deploy tab for instructions to deploy the server directly from git.
Otherwise have a look [here for a full article on how to deploy the code](https://devcenter.heroku.com/articles/git).


## Getting the user info

Now that we have an access token for the authorized user, we can use it to actually call Github's APIs.
The goal for my application was simply to have a way to identify unique users, hence I did not include any scopes in the token request.
To get a user's public information, we can use the `/user` endpoint.
Below is a code snippet to request the user information from Github.

```js
fetch('https://api.github.com/user', {
	headers: {
		Authorization: `token ${token}`,
	},
})
	.then(async (res) => {
		const user = await res.json();
		...
	});
```

The user object returned contains all the public information for the given user's profile, including Github username, id, email address, and profile picture.
