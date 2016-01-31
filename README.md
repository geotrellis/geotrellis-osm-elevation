# Geotrellis OSM Elevation project

## Background

The OSM Elevation project integrates [OpenStreetMap](https://www.openstreetmap.org) data with Geotrellis to color roads with useful elevation data.

#### To run viewer

```console
> cd viewer
> npm install
> npm install -g nodemon
> npm start
```

#### To run ingest

```console
> ./sbt
```

In SBT console,
```console
> project ingest
> run
```

Choose the number corresponding to YieldIngest or LandsatIngest.

#### To run server

```console
> ./sbt
```


In SBT console,
```console
> project server
> reStart local ../data/catalog
```
