# Geotrellis OSM Elevation project

[![Join the chat at https://gitter.im/geotrellis/geotrellis-osm-elevation](https://badges.gitter.im/geotrellis/geotrellis-osm-elevation.svg)](https://gitter.im/geotrellis/geotrellis-osm-elevation?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Background

The OSM Elevation project integrates [OpenStreetMap](https://www.openstreetmap.org) data with Geotrellis to color roads with useful elevation data.

This project will be used to find elevation data for roads in Open Street Map. We are researching ways to do this including vector tiles, and using GeoWave/GeoMesa.

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
