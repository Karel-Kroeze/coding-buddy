# Coding Buddy

Coding buddy makes it quick and easy to code qualitative artifacts. It supports text, images, and concept maps natively and can be easily adapted to support other artifacts.

Creating projects allows you to collaborate with other coders, and easily assign artifacts to coders so that there is enough overlap between coders to calculate inter-rater reliability, but no coding goes wasted.

## How to use

Coding buddy is designed as a docker container, and running it is as simple as calling `docker-compose up`. Note that the container expects a mongodb container named `mongo` to be accessible on the same network. The included `docker-compose.yml` file provides a basic setup.
