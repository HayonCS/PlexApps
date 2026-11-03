# Introduction

<style>
table {
	background: white;
	border: 1px solid black;
	border-spacing: 0px;
}
th {
	background: #0d51a6;
	color: white;
	border-spacing: 0px;
}
tr {
	color: black;
	border-spacing: 0px;
} 
tr:nth-child(2n) {
	color: black;
	background: #f6f3e7;
	border-spacing: 0px;
} 
</style>

# Dashboards

This section is about how to navigate to various different dashboards with different settings.

## Single Asset Dashboard

`/dashboard/<assetName>`

`/dashboards/<assetName>`

| Parameter     | Description                         | Example Values                        |
| :------------ | :---------------------------------- | :------------------------------------ |
| `<assetName>` | Name of the asset you want to view. | `CMB2-C015`, `MR-J004`, `PCB027-3873` |

Examples:

- http://localhost:3001/dashboard/CMB2-C015
- http://localhost:3001/dashboards/MR-J004

## Multi-Asset Dashboard

`/dashboard/multi/<assetName1>,<assetName2>,<assetName3>,...,<assetNameN>`

`/dashboards/multi/<assetName1>,<assetName2>,<assetName3>,...,<assetNameN>`

| Parameter      | Description                                                                      | Example Values |
| :------------- | :------------------------------------------------------------------------------- | :------------- |
| `<assetName1>` | Name of the single asset you want to view.                                       | `CMB-J141`     |
| `<assetName2>` | Another name of the single asset you want to view.                               | `CMB-J109`     |
| `<assetName3>` | Another name of the single asset you want to view.                               | `CMB-J145`     |
| `<assetNameN>` | Another name of the single asset you want to view. As many assets as you'd like. | `CMB-J078`     |

Examples:

- http://localhost:3001/dashboard/multi/CMB-J141,CMB-J109,CMB-J145
- http://localhost:3001/dashboards/multi/CMB-J078,CMB-J071,CMB-J073

# GraphiQL

`/graphiql`

This page shows the GraphiQL endpoint, allowing interaction with the app's GraphQL API. This is a sort of interactive documentation, outlining queries and mutations that are available.
