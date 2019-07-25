[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<p align="center">
<img alt="SeeQL Title" src="https://user-images.githubusercontent.com/46896778/61765218-2814ad00-adaa-11e9-9188-1bcf42fcca41.png">
</p>

---

Welcome to **QLStico(beta)**: An easy-to-use desktop application redefining Postgres database access and visualization through an intuitive UI and the power of GraphQL.

## Getting Started

#### Requirements

MacOS is fully supported, Linux supported through manually compiling the package. Postgres must be accessible on your machine and/or remote server on port 5432.

#### How to Install

Beta Release 0.0.1
Download available at [www.qlstico.io](https://www.qlstico.io)
_You may need to configure your security settings to allow downloaded file to open_

## Features

**Creating a Connection**

Upon opening the app, you will be brought to your `Connections` page:

![Connect](https://user-images.githubusercontent.com/46896778/61913745-0af7ef80-af0c-11e9-873a-484936795f16.png)

You have the option to specify a Postgres connection you wish to create and store via the `Create Connection` button. By default, the `User` and `Host` fields are pre-populated with your OS's currently logged in username and 'localhost', respectively.

In most cases, unless you have a protected connection, this should be good enough to hit submit and create a valid local connection configuration. Otherwise, feel free to provide a `Password` and/or a different `Host` to connect to (default port is 5432). Leaving the `Database Name` field empty will render all databases found for that connection, and entering a specific database name in that field will isolate connections to only that database.

You may also connect to remote Postgres databases by entering all required credentials in the form fields and clicking the checkbox to enable SSL:

![Create Connection](https://user-images.githubusercontent.com/46896778/61913744-0af7ef80-af0c-11e9-921f-cb9ea0ba2ff2.png)

After creating a connection configuration, you are brought back to the `Connections` page where your created configuration is stored as a tile for future use. You may have several connection configurations that will all exist as their own tile. Hit `Connect` on any existing connection tile to use that connection configuration.

![Connection Tiles](https://user-images.githubusercontent.com/46896778/61913916-a9845080-af0c-11e9-9070-79f681ce6695.png)

**Editing a Connection**

You always have the option to `Edit` existing connections or `Remove` them right from their respective tile's buttons!

**Viewing Databases**

After establishing a valid local or SSL connection, you will see all your PG databases rendered as tiles (or if a specific database name was specified on the configuration form, only that database tile will show). Double-click any tile to enter the database of choice!

![All DBs](https://user-images.githubusercontent.com/46896778/61913915-a9845080-af0c-11e9-8a67-5bd84fe9c7b5.png)

**Adding/Deleting Databases**

You have the option of pressing the `Add A Database` button at any time while on this page. This will prompt you to provide a database name to create. You will recieve confirmation creation upon successful creation, or be notified of any error.

![Add DB](https://user-images.githubusercontent.com/46896778/61913742-0af7ef80-af0c-11e9-9665-190b81947ccd.png)

You also have the option of deleting a database by single-clicking to select it (indicated with dark grey background behind tile), and the `Remove Database` button will apear at the top of the page. Clicking this will prompt confirmation before deletion. You will be notified of successful deletion, or if any error occured.

![Delete DB](https://user-images.githubusercontent.com/46896778/61913743-0af7ef80-af0c-11e9-91ac-4b7bab90ff00.png)

**Viewing Tables**

You are able to view all tables contained by a database. You may double-click on any of these tiles to enter the table and see it's contents.

![All Tables](https://user-images.githubusercontent.com/46896778/61913741-0af7ef80-af0c-11e9-9eb7-afe161c78d51.png)

**Adding/Deleting Tables**

Similar to adding/deleting databases, you can add or delete a table to the database by pressing the corresponding `Add a Table` or `Remove Table` buttons (deletion option available upon single-clicking a table to select it).

**Generating GraphQL Queries & Mutations**

At the top of the all tables view, there are corresponding `GraphQL Queries` and `Visualize Schema` buttons. Clicking the `GraphQL Queries` button will open a seperate window with a PostGraphiQL IDE which represents you database tables in a GraphQL queriable format.

You can write a **GraphQL query** or **GraphQL mutation** in the lefthand input section, and once your command is complete, click **Play** button near top. If your query has any errors, an error message will display telling you exactly where the error occured.

![gQLIDE](https://user-images.githubusercontent.com/46896778/61913740-0a5f5900-af0c-11e9-9a10-3f7d380b1974.png)

After clicking **Play**, you will be able to see your results in the righthand **Results** section. Additionally, the `Docs` and `Explorer` buttons will reveal helpful information to help contruct
GraphQL queries.

**Visualizing GraphQL Schema**

Next to the `GraphQL Queries` button, the `Visualize Schema` button will open a new window that shows a visual representation of the current database's table relations. These are generated using the same GraphQL schema used for the PostGraphiQL IDE.

![Voyager](https://user-images.githubusercontent.com/46896778/61913738-0a5f5900-af0c-11e9-8762-237a49b9b215.png)

**Table Contents Grid View**

Upon entering a table, a grid is generated comprised of all of it's contents. You may single-click to select a row, prompting the `Remove Row` button to appear to give the option of deletion.

![Table Grid](https://user-images.githubusercontent.com/46896778/61913736-0a5f5900-af0c-11e9-8d30-abf2b6173b74.png)

Double-clicking a row sets that row into edit mode for you to modify any of the row's contents. Upon changing any item(s), you may hit submit to update your table with these changes. Any errors in updating will be reported back to you.

![Update Row](https://user-images.githubusercontent.com/46896778/61913737-0a5f5900-af0c-11e9-85b0-ff93b8fe1d08.png)

**Navigation**

Navigating between different page views is as easy as pressing any of the breadcrumb links in the Nav Bar, or pressing the back arrow to go to the immediately preceeding page. You may also click the QLSTico icon to be brought back to your connections page.

The refresh button retrieves any new information included in your databases that were created or modified outside of QLStico.

![Nav](https://user-images.githubusercontent.com/46896778/61913734-0a5f5900-af0c-11e9-9acc-f04a61bd8947.png)

## Common Issues

If you have pulled a new version of the application and clicking the DB connection tile crashes the app, delete your existing connection tile and create a new one. If you continue to experience difficulty,please submit a Github issue.

## Resources

Built on Electron, React and Postgraphile.

**Creators:** [Ricardo Pineda](http://github.com/ricardopineda93), [Jack Dwyer](https://github.com/dwyfrequency), [William Golden](https://github.com/willgolden5), [Sri Velagapudi](https://github.com/sriv97)

[![Travis CI](https://travis-ci.org/qlstico/parcelQL.svg?branch=master)](https://travis-ci.org/qlstico/parcelQL)
[![Azure Pipelines](https://img.shields.io/vso/build/shamofu/electron-react-parcel-boilerplate/9/master.svg?label=Azure%20Pipelines&style=flat-square)](https://dev.azure.com/shamofu/electron-react-parcel-boilerplate/_build/latest?definitionId=9)
[![Dependencies Status](https://img.shields.io/david/shamofu/electron-react-parcel-boilerplate.svg?style=flat-square)](https://david-dm.org/shamofu/electron-react-parcel-boilerplate)
[![DevDependencies Status](https://img.shields.io/david/dev/shamofu/electron-react-parcel-boilerplate.svg?style=flat-square)](https://david-dm.org/shamofu/electron-react-parcel-boilerplate?type=dev)
