[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<p align="center">
<img width="250" alt="SeeQL Title" src="https://user-images.githubusercontent.com/46896778/61082299-31d80100-a3f7-11e9-812f-00f9916ef804.png">
</p>

---

Welcome to **QLStico(beta)**: An easy-to-use desktop application redefining Postgres database access and visualization through an intuitive UI and the power of GraphQL.

## Getting Started

#### Requirements

MacOS is fully supported, Linux supported through manually compiling the package. Postgres should be installed on your machine.

#### How to Install

Beta Release 0.0.1
Download available at [www.qlstico.io](https://www.qlstico.io)

## Features

**Creating a Connection**

Upon opening the app, you will be brought to your `Connections` page:

![First Connection](https://user-images.githubusercontent.com/46896778/60853263-45058980-a1c9-11e9-91ee-b7322b7ff2d4.png)

You have the option to specify a Postgres connection you wish to create and store via the `Create Connection` button. By default, the `User` and `Host` fields are pre-populated with your OS's currently logged in username and 'localhost', respectively.
In most cases, unless you have password protected databases or proctected connections, this should be good enough to hit submit and create a valid connection configuration. Otherwise, feel free to provide a `Password` and/or a different `Host` to connect to (default port is 5432).

![Create Connection](https://user-images.githubusercontent.com/46896778/60853269-4931a700-a1c9-11e9-871e-ff03a5569507.png)

After creating a connection configuration, you are brought back to the `Connections` page where your created configuration is stored as a tile for future use. You may have several connection configurations that will all exist as their own tile. Hit `Connect` on any existing connection tile to use that connection configuration.

![Connection Tile](https://user-images.githubusercontent.com/46896778/60885215-0dc0c800-a21d-11e9-9350-2fbcb5753edc.png)

**Editing a Connection**

You always have the option to `Edit` existing connections or `Remove` them right from their respective tile's buttons!

**Viewing Databases**

After establishing a valid connection, you will see all your PG databases rendered as tiles. Double-click any tile to enter the database of choice!

![View All Dbs](https://user-images.githubusercontent.com/46896778/60851525-78dcb100-a1c1-11e9-8fea-3844b6641640.png)

**Adding/Deleting Databases**

You have the option of pressing the `Add A Database` button at any time while on this page. This will prompt you to provide a database name to create.

You also have the option of deleting a database by single-clicking to select it (indicated with dark grey background behind tile), and the `Remove Database` button will apear at the top of the page. Clicking this will delete the selected database.

![Add or Delete DB](https://user-images.githubusercontent.com/46896778/60851645-00c2bb00-a1c2-11e9-894d-af6fef86f4cc.png)

**Viewing Tables**

You are able to view all tables contained by a database. You may double-click on any of these tiles to enter the table and see it's contents.

![All Tables](https://user-images.githubusercontent.com/46896778/60852187-97907700-a1c4-11e9-8438-a50a30c10937.png)

**Adding/Deleting Tables**

Similar to adding/deleting databases, you can add or delete a table to the database by pressing the corresponding `Add a Table` or `Remove Table` buttons (deletion option available upon single-clicking a table to select it).

**Generating GraphQL Queries & Mutations**

At the top of the all tables view, there are corresponding `GraphQL Queries` and `Visualize Schema` buttons. Clicking the `GraphQL Queries` button will open a seperate window with a PostGraphiQL IDE which represents you database tables in a GraphQL queriable format.

You can write a **GraphQL query** or **GraphQL mutation** in the lefthand input section, and once your command is complete, click **Play** button near top. If your query has any errors, an error message will display telling you exactly where the error occured.

![PostGraphiQL Window](https://user-images.githubusercontent.com/46896778/60852189-9a8b6780-a1c4-11e9-8d5c-24cc7206c218.png)

After clicking **Play**, you will be able to see your results in the righthand **Results** section. Additionally, the `Docs` and `Explorer` buttons will reveal helpful information to help contruct
GraphQL queries.

**Visualizing GraphQL Schema**

Next to the `GraphQL Queries` button, the `Visualize Schema` button will open a new window that shows a visual representation of the current database's table relations. These are generated using the same GraphQL schema used for the PostGraphiQL IDE.

![Voyager Schema Visualizer](https://user-images.githubusercontent.com/46896778/60852414-9e6bb980-a1c5-11e9-9bc1-07c2534767fc.png)

**Table Contents Grid View**

Upon entering a table, a grid is generated comprised of all of it's contents. You may single-click to select a row, prompting the `Remove Row` button to appear to give the option of deletion.

![Table Grid View](https://user-images.githubusercontent.com/46896778/60852582-441f2880-a1c6-11e9-82e5-1bae0064f91b.png)

Double-clicking a row sets that row into edit mode for you to modify any of the row's contents. Upon changing any item(s), you may hit submit to update your table with these changes. Any errors in updating will be reported back to you.

![Submission Error](https://user-images.githubusercontent.com/46896778/60852776-230b0780-a1c7-11e9-8618-6f80adbe7de7.png)

**Navigation**

Navigating between different page views is as easy as pressing any of the breadcrumb links in the Nav Bar, or pressing the back arrow to go to the immediately preceeding page.

The refresh button retrieves any new information included in your databases that were created or modified outside of QLStico.

![Navigation](https://user-images.githubusercontent.com/46896778/61070896-b61d8a80-a3dd-11e9-86c1-94200ab864f9.png)

## Resources

Built on Electron, React and Postgraphile.

**Creators:** [Ricardo Pineda](http://github.com/ricardopineda93), [Jack Dwyer](https://github.com/dwyfrequency), [William Golden](https://github.com/willgolden5), [Sri Velagapudi](https://github.com/sriv97)

[![Travis CI](https://travis-ci.org/qlstico/parcelQL.svg?branch=master)](https://travis-ci.org/qlstico/parcelQL)
[![Azure Pipelines](https://img.shields.io/vso/build/shamofu/electron-react-parcel-boilerplate/9/master.svg?label=Azure%20Pipelines&style=flat-square)](https://dev.azure.com/shamofu/electron-react-parcel-boilerplate/_build/latest?definitionId=9)
[![Dependencies Status](https://img.shields.io/david/shamofu/electron-react-parcel-boilerplate.svg?style=flat-square)](https://david-dm.org/shamofu/electron-react-parcel-boilerplate)
[![DevDependencies Status](https://img.shields.io/david/dev/shamofu/electron-react-parcel-boilerplate.svg?style=flat-square)](https://david-dm.org/shamofu/electron-react-parcel-boilerplate?type=dev)
