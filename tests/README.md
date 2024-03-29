# Sensei Unit Tests

## Setup

### Using Varying Vagrant Vagrants

1) Follow [these instructions](https://varyingvagrantvagrants.org/docs/en-US/installation/) to install VVV.
2) Open `config/config.yml`.
3) In the `wordpress-trunk` sites entry, set `skip_provisioning` to `false`.
4) Run `vagrant up --provision`.
5) Enter `vagrant ssh` to SSH into the machine that's running your Sensei site.
6) Execute `cd /srv/www/wordpress-one/public_html/wp-content/plugins/sensei` (location may vary depending on which directory Sensei is in).
7) Install the tests:

    `$ tests/bin/install_vvv.sh`

### In your local machine

The following instructions should work on Linux and macOS. If you want to run the tests on Windows please see [this guide](https://github.com/Automattic/sensei/wiki/Setting-Up-Development-Environment) and the instructions on using Varying Vagrant Vagrants above.

#### Prerequisites

To run the tests locally, you will need the following:
1. [Composer](https://getcomposer.org/).
2. A MySQL database. 

Do not use an existing database or you will lose data. To install a database locally, there are two options.

##### Install a MySQL database using Docker

1. Install docker by following the instructions [here](https://docs.docker.com/get-docker/).
2. Run `docker run --name mysql_57 -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=<test_db_name> -e MYSQL_USER=<test_user_name> -e MYSQL_PASSWORD=<test_user_password> --rm -d mysql:5.7`

The above will start a MySQL server container and create a database with the specified name and a user with the supplied username and password. To stop the container you can use `docker container stop mysql_57`.

##### Use MySQL Server

To install MySQL follow the instructions provided [here](https://dev.mysql.com/doc/refman/5.7/en/installing.html).

#### Install WP test suite

To install the WP test suite you need to first run `composer install` and `npm install` in the top level directory. Then you need to use the `tests/bin/install-wp-tests.sh` script to install the WP test suite.

`install-wp-tests.sh` script needs `svn` to be installed in order to create test files. You can find instructions for installing ``svn`` [here](https://subversion.apache.org/packages.html).

If you used Docker to create a database, you need to pass the database name and the user credentials from the previous step. You also need to skip creating a new database:

`TMPDIR=/tmp ./tests/bin/install-wp-tests.sh <test_db_name> <test_user_name> <test_user_password> 127.0.0.1 latest true`

If you used MySQL Server you need to supply the values for the new database only:

`TMPDIR=/tmp ./tests/bin/install-wp-tests.sh <test_db_name> <test_user_name> <test_user_password>`

## Running Tests

To run both PHPUnit and Jest tests you can use the following command in the plugin root directory:

    $ npm run test

If you are interested in PHPUnit tests only, you can use the following:
    
    $ npm run test-php

If you are interested in Jest tests only, you can use the following:

	$ npm run test-js

You can run specific tests by providing the path and filename to the test class. For example:

    $ npm run test-php tests/unit-tests/test-class-admin

## Writing Tests

* Each test file should roughly correspond to an associated source file, e.g. the `test-class-woothemes-sensei.php` test file covers code in `class-woothemes-sensei.php`.
* Each test method should cover a single method or function with one or more assertions.
* A single method or function can have multiple associated test methods if it's a large or complex method.
* Prefer `assertSame()` where possible as it tests both type & equality.
* Remember that only methods prefixed with `test` will be run.
* Filters persist between test cases so be sure to remove them in your test method or in the `tearDown()` method.
