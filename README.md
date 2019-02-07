# Dendra Build API

A dispatcher service that publishes build requests to a worker queue. Used to generate annotation side-effects and aggregate calculations. Built using [Feathers](https://feathersjs.com).


## Instructions

1. Be sure you have Node version 10.14.2. If you’re using nvm, you may need to `nvm use 10.14.2`.

2. Clone this repo.

3. Make this project directory the current directory, i.e. `cd dendra-build-api`.

4. Install modules via `npm install`.

5. If all goes well, you should be able to run the predefined package scripts.


## To build and publish the Docker image

1. Make this project directory the current directory, i.e. `cd dendra-build-api`.

2. Build the project `docker build -t dendra:dendra-build-api .`.

3. Tag the desired image, e.g. `docker tag f0ec409b5194 dendra/dendra-build-api:latest`.

4. Push it via `docker push dendra/dendra-build-api`.
