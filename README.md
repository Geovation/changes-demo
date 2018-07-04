Changes demo
============

Demonstrates how frequently OS data is updated. [See it here.](https://geovation.github.io/changes-demo)

Development
-----------

There is no build process, and everything can be served statically from the root directory. One way to do this is with [Live Server](https://github.com/tapio/live-server):

    $ live-server --port=8000

### Building topography tiles

The included Makefile can generate new sets of topography tiles. Gdal and Tippecanoe must be installed first. To build the tiles there needs to be a `sources` directory containing the OS MasterMap tiles (`.gz` format) that you want to use. There also needs to be a building heights CSV file. Update the Makefile to include the correct filename for the building heights. Then run:

    $ make topography

This will create a new `topography` directory, with a folder for each tileset, in Mapbox Vector Tile ZXY format. The `-j` flag can be used to parallelise this, as it might be slow otherwise. After they've been created, you will need to update `main-page.js` to specify the name of each tile.

### Building terrain tiles

The Makefile can also generate new sets of terrain tiles. Gdal, [Rio](https://pypi.python.org/pypi/rasterio), [Rio-RGBify](https://pypi.python.org/pypi/rio-rgbify), and [MB-Util](https://pypi.python.org/pypi/mbutil) must be installed first. To build the tiles there needs to be a `sources` directory containing the OS Terrain 5 (or Terrain 50) tile (`.zip` format) that you want to use. Then run:

    $ make terrain

This will create a new `terrain` directory with the tileset in [Mapbox Terrain-RGB](https://blog.mapbox.com/global-elevation-data-6689f1d0ba65) ZXY format.

For the current project use the [SU18](https://en.wikipedia.org/wiki/Ordnance_Survey_National_Grid) according to the British National Grid 
