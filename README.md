# Dendra Aggregate API

A management service to dispatch data aggregate calculations, such as daily cumulative precipitation. Built using [Feathers](https://feathersjs.com).


## Instructions

1. Be sure you have Node version 8.11.3. If you’re using nvm, you may need to `nvm use 8.11.3`.

2. Clone this repo.

3. Make this project directory the current directory, i.e. `cd dendra-aggregate-api`.

4. Install modules via `npm install`.

5. If all goes well, you should be able to run the predefined package scripts.


## To build and publish the Docker image

1. Make this project directory the current directory, i.e. `cd dendra-aggregate-api`.

2. Build the project `docker build -t dendra:dendra-aggregate-api .`.

3. Tag the desired image, e.g. `docker tag f0ec409b5194 dendra/dendra-aggregate-api:latest`.

4. Push it via `docker push dendra/dendra-aggregate-api`.
