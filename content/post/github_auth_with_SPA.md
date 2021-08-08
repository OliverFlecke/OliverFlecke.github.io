---
title: Authenticate with Github on a Single-Page Application
date: 2021-08-08
draft: true
---

Link to code TBA

<!-- Introduction -->
For a recent project, I wanted a way to authenticate users, but without all the struggle of managing users and their data.
This was for a frontend, single-page application (SPA) where everything could be served as static HTML/CSS/JS files.
My solution was to allow users to sign in with their Github credentials using OAuth.
This is the best of both worlds: I won't have to store any user data or think much about security, and users don't have to trust me with their email or password.

Github provide [some good documentation](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#web-application-flow) for how to perform this flow from inside a web browser, with one minor issue: [Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).
Because one of the calls to Github's API does not allow CORS, meaning you cannot call it from outside Github's domain, it is not possible to complete the OAuth flow entirely in the browser.
But [later](#getting-an-access-token) we will see a relative simple solution to get around this problem.

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
