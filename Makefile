# TODO from the terrain tiles generated, automatically define the bounding box (bounds according to https://github.com/mapbox/tilejson-spec/tree/master/2.2.0)
# for mapbox to avoid the errors

heights = sources/su18nw_bldgHts.csv

topography: $(addprefix topography/, $(notdir $(basename $(wildcard sources/*.gz))))

topography/%: %.geo.json
	mkdir -p topography
	tippecanoe \
		--no-feature-limit \
		--no-tile-size-limit \
		--no-tile-compression \
		--no-tiny-polygon-reduction \
		--low-detail 11 \
		--minimum-detail 11 \
		--minimum-zoom 12 \
		--maximum-zoom 16 \
		--layer $(basename $@) \
		--output-to-directory $@ \
		$<

%.geo.json: %.sqlite
	ogr2ogr \
		-f geojson \
		-select make,descriptiveGroup1,height \
		$@ \
		$<

%.sqlite: %.gml
	ogr2ogr \
		-f sqlite \
		-s_srs 'EPSG:27700' \
		-t_srs 'EPSG:4326' \
		-splitlistfields \
		-nln geo \
		$@ \
		$< \
		TopographicArea
	rm $(basename $<).gfs
	ogr2ogr \
		-update \
		-f sqlite \
		-nln heights \
		$@ \
		$(heights)
	ogrinfo \
		-sql 'ALTER TABLE geo ADD COLUMN height DECIMAL' \
		$@
	ogrinfo \
		-sql 'UPDATE geo SET height = (SELECT (CAST(heights.abshmax AS DECIMAL) - CAST(heights.abshmin AS DECIMAL)) FROM heights WHERE heights.toid = geo.fid)' \
		$@

%.gml: sources/%.gz
	gunzip \
		--to-stdout \
		$< \
		> $@

terrain: $(addsuffix .mbtiles, $(notdir $(basename $(wildcard sources/*.zip))))
	mb-util \
		$< \
		$@

%.mbtiles: %.geo.tiff
	rio rgbify \
		--interval 0.01 \
		--min-z 12 \
		--max-z 16 \
		$< \
		$@

%.geo.tiff: %.asc
	gdalwarp \
		-of gtiff \
		-s_srs 'EPSG:27700' \
		-t_srs 'EPSG:3857' \
		$< \
		$@

%.asc: sources/%.zip
	unzip \
		-p \
		$< \
		> $@
