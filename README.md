# Personal website

This repository contains my personal website.

Current content includes education information and work experience, along with different posts with notes and selected project.

## Build

The project is build using [Hugo](https://gohugo.io).
The website can be build using

```sh
hugo -d _public --minify
```

## Publish the site

The site will be automatically build and published when pushed to master using Github Actions.

Otherwise it can be published from your local repository using `scripts/publish.sh`.

## Serve the website locally

To run the server locally (with hotreload):

```sh
hugo server
```
