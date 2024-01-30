# broadcast-bot-backend

> Middleware for wire channel bot.

## Table of Contents
* [General Info](#general-information)
* [Technologies Used](#technologies-used)
* [Features](#features)
* [Setup](#setup)
* [Project Status](#project-status)


## General Information


## Technologies Used
- nodeJS 20 
- docker
- postgres


## Features
List the ready features here:


## Setup
- clone repo
- check .env 
- docker compose up 


## Project Status
Project is: _in progress_ 


## database schema
user
+-------------+--------------+----------------------------+
| name        | type         | properties                 |
+-------------+--------------+----------------------------+
| id          | number       | PRIMARY KEY AUTO_INCREMENT |
| firstname   | string       |                            |
| lastname    | string       |                            |
| email       | string       |                            |
| userId      | string       |                            |
| userToken   | string       |                            |
| preKey      | string       |                            |
| createdAt   | Date         |                            |
| updateAt    | Date         |                            |
+-------------+--------------+----------------------------+

+-------------+--------------+----------------------------+
|                        channel                          |
+-------------+--------------+----------------------------+
| id          | number      | PRIMARY KEY AUTO_INCREMENT |
| name        | string       |                            |
| secToken    | string       |                            |
| createdAt   | Date         |                            |
| updateAt    | Date         |                            |
+-------------+--------------+----------------------------+

+-------------+--------------+----------------------------+
|                        channelToUser                    |
+-------------+--------------+----------------------------+
| questionId  | number       | PRIMARY KEY FOREIGN KEY    |
| categoryId  | number       | PRIMARY KEY FOREIGN KEY    |
| id          | number       |                            |
| isMuted     | boolean      |                            |
| isApproved  | boolean      |                            |
+-------------+--------------+----------------------------+

