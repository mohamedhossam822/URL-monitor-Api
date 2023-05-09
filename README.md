# URL-monitor-Api
RESTful API server that allows users to monitor URLs, and get detailed uptime reports about their availability, average response time, and total uptime/downtime.

# Environment vars
This project uses the following environment variables:

| Name                          | Description                         | Default Value                                  |
| ----------------------------- | ------------------------------------| -----------------------------------------------|
|PORT           | The port the project will be running at          | 3000      |
|MOGOURI           | The MongoDB connection string           | -     |
|SECRET           | The string used to sign and decode jwt tokens           | -      |
|SENDEREMAIL           | The mail the project will be sending emails from          | -     |
|SENDERPASS           | Password of that mail           | -     |


# Pre-requisites
- Install [Node.js](https://nodejs.org/en/) version 18.0.0
- Allow sending from external resource on your email

# Getting started
- Download or clone the repository
- Install dependencies
```
cd <project_name>
npm install
```
- Build and run the project
```
npm run test
```
- Navigate to `http://localhost:3000`

# API Documentation
  After running the project navigate to  http://localhost:3000/ for a swagger-ui detailing how to use every route.<br>
Also Find the swagger json file in the Swagger folder /swagger.json
