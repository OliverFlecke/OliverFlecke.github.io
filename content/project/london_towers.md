---
title: Getting to know the towers of London
date: 2022-06-24
---

I recently moved to London and was stunned by the cities skyline.
So I wanted to learn the names of some of these recognizable landmarks, so I took a photo of central London from the Canary Wharf area and build a webapp around it to display the name and some interesting information of each building, along with links to relevant sides about each.
The site can be found at [london.oliverflecke.me](https://london.oliverflecke.me).

![Screenshot of the London Towers application, showing the skyline of central London](/media/london-towers-screenshot.png)

## Tech behind the app

The app is build using React/NextJS using TypeScript and Tailwindcss, using a MongoDB database to host information about each of the buildings.
As part of the project, I thought it would be fun to make a simple, yet not too basic example of a webapp connected to a database running on [Kubernetes](https://kubernetes.io).
While needing a database for this project wasn't strictly necessary, as all of the tower information could just be stored statically within the app, that seemed to boring.
So after wrapping the application in a [Docker](https://docker.io) container to prepare it for deployment, I thought "why not over-engineer it?"

So included in [my repository on Github](https://github.com/OliverFlecke/london-towers) is a `kube` directory containing all the relevant configurations for deploying the service to Kubernetes.
Most people like won't have a kubernetes cluster running around, so the [README](https://github.com/OliverFlecke/london-towers/blob/main/README.md) contains details about getting everything up and running using [minikube](https://minikube.sigs.k8s.io/docs/).
