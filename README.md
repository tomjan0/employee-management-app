# EmployeeManagementApp

This application is a part of engineering thesis 'Application for employee management' by Tomasz Janik written at
Wrocław University of Science and Technology.

## Live version

App is served on firebase hosting and available here: https://employee-management-84591.web.app/.

## About

The purpose of this app is to help managers collect availability of theirs employees and make a correct schedule. It
achieves that by providing intuitive interface and auto generation of a schedule. Generation of a schedule is based on
binary programing model.

## Main functionalities:

* Schedule generation
* Collecting availability
* Overview statistics

## Technologies:

* Angular
* Firebase
  * Authentication
  * Firestore
  * Functions
  * Hosting
* Google Cloud Run
* Google OR-Tools

## Run locally

First you have to install dependencies, by running `npm install`. Note that it requires Node.js. Then un `ng serve` for
a dev server and navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source
files.
