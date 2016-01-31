<<<<<<< HEAD
#git test#
=======
# Project Description: use elevation data for roads
>>>>>>> upstream/master
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
