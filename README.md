# 2023-2 MeasureSoftGram Frontend

Frontend repository of MeasureSoftGram application.

## Badges

[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=fga-eps-mds_2023-1-MeasureSoftGram-Front&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=fga-eps-mds_2023-1-MeasureSoftGram-Front)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=fga-eps-mds_2023-1-MeasureSoftGram-Front&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=fga-eps-mds_2023-1-MeasureSoftGram-Front)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=fga-eps-mds_2023-1-MeasureSoftGram-Front&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=fga-eps-mds_2023-1-MeasureSoftGram-Front)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=fga-eps-mds_2023-1-MeasureSoftGram-Front&metric=bugs)](https://sonarcloud.io/summary/new_code?id=fga-eps-mds_2023-1-MeasureSoftGram-Front)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=fga-eps-mds_2023-1-MeasureSoftGram-Front&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=fga-eps-mds_2023-1-MeasureSoftGram-Front)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=fga-eps-mds_2023-1-MeasureSoftGram-Front&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=fga-eps-mds_2023-1-MeasureSoftGram-Front)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=fga-eps-mds_2023-1-MeasureSoftGram-Front&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=fga-eps-mds_2023-1-MeasureSoftGram-Front)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=fga-eps-mds_2023-1-MeasureSoftGram-Front&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=fga-eps-mds_2023-1-MeasureSoftGram-Front)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=fga-eps-mds_2023-1-MeasureSoftGram-Front&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=fga-eps-mds_2023-1-MeasureSoftGram-Front)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=fga-eps-mds_2023-1-MeasureSoftGram-Front&metric=coverage)](https://sonarcloud.io/summary/new_code?id=fga-eps-mds_2023-1-MeasureSoftGram-Front)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=fga-eps-mds_2023-1-MeasureSoftGram-Front&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=fga-eps-mds_2023-1-MeasureSoftGram-Front)
[![codecov](https://codecov.io/gh/fga-eps-mds/2023-1-MeasureSoftGram-Front/branch/develop/graph/badge.svg?token=A76GCxS118)](https://codecov.io/gh/fga-eps-mds/2023-1-MeasureSoftGram-Front)

<br>

<img src="https://codecov.io/gh/fga-eps-mds/2023-1-MeasureSoftGram-Front/branch/develop/graphs/sunburst.svg?token=A76GCxS118" width="128"/>


## Links

- Prod: [https://measure-soft-gram.vercel.app/](https://measure-soft-gram.vercel.app/)
- Stage: [https://measure-soft-gram-staging.vercel.app/](https://measure-soft-gram-staging.vercel.app/)

## Installation

### Install nvm

* <code>sudo apt install curl </code>
* <code>curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash </code>

Close the terminal and run the following command:
* <code>command -v nvm</code>

It should print 'nvm' if the installation was successful.

### Install node with nvm

* <code>nvm install v16.13.1</code>

### Install yarn

* <code>npm install --global yarn</code>

It should print the version of yarn if the installation was successful.

## Usage

### Copy environment variables

#### Local or Development
* <code>cp .envs/.env.local .env </code>
* <code>cp .envs/.env.development .env </code>

### Start project local

* <code>yarn dev</code>

The project will run on [http://localhost:3000](http://localhost:3000)

### Run ESLint
* <code>yarn lint</code>
