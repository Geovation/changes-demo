import React from 'react'
import ReactDOM from 'react-dom'
import HTML from 'react-dom-factories'
import MapboxGL from 'mapbox-gl'

export default class Map extends React.Component {

    constructor() {
        super()
        this.state = {
            loaded: false
        }
        this.display = this.display.bind(this)
        this.pushSelected = this.pushSelected.bind(this)
        this.style = this.style.bind(this)
        this.whenMapStyleLoaded = this.whenMapStyleLoaded.bind(this)
        this.newLayers = []
        this.toDeleteLayers = []
    }

    display() {
        const sources = {
            'terrain': {
                type: 'raster-dem',
                tiles: [window.location.href + 'terrain/{z}/{x}/{y}.png']
            }
        }
        const layers = [
            {
                id: 'background',
                type: 'background',
                paint: {
                    'background-color': '#444'
                }
            },
            {
                id: 'hillshading',
                type: 'hillshade',
                source: 'terrain'
            }
        ]
        this.renderer = new MapboxGL.Map({
            style: { version: 8, sources, layers },
            container: ReactDOM.findDOMNode(this),
            center: this.props.centre,
            zoom: this.props.zoom,
            minZoom: 12,
            maxZoom: 16
        })
        document.querySelector('.mapboxgl-missing-css').remove() // hack
        this.renderer.on('load', () => {
            this.pushSelected()
            this.setState({ loaded: true })
        })

        this.renderer.on("render", (e) => {
            this.lastRendered = Date.now()
        })

    }

    pushSelected() {
        const topography = this.props.topographyList[this.props.topographySelected]

        if (!this.renderer.getSource(topography.data)) {
          this.renderer.addSource(topography.data, {
            type: 'vector',
            tiles: [window.location.href + topography.data + '/{z}/{x}/{y}.pbf']
          })
        }

        this.style(topography.data).forEach(layer => {
          this.newLayers.push(layer.id)
          this.renderer.addLayer(layer)
          this.renderer.moveLayer('hillshading')
        })

        this.whenMapStyleLoaded(() => {
            this.toDeleteLayers.forEach((id) => {
                this.renderer.removeLayer(id)
                this.rendeder.removeSource(id)
            })

            this.toDeleteLayers = this.newLayers
            this.newLayers = []
        })

    }

    style(topography) {
        return [
            {
                'id': topography + '-fields',
                'type': 'fill',
                'source': topography,
                'source-layer': topography,
                'filter': [
                    'in',
                    'descriptivegroup1',
                    'General Surface',
                    'Landform',
                    'Roadside'
                ],
                'paint': {
                    'fill-color': '#c7fda0',
                    'fill-outline-color': '#87b36a'
                }
            },
            {
                'id': topography + '-urban',
                'type': 'fill',
                'source': topography,
                'source-layer': topography,
                'filter': [
                    '==',
                    'descriptivegroup1',
                    'Unclassified'
                ],
                'paint': {
                    'fill-color': '#cbcc99',
                    'fill-outline-color': '#7a9068'
                }
            },
            {
                'id': topography + '-semiurban',
                'type': 'fill',
                'source': topography,
                'source-layer': topography,
                'filter': [
                    'all',
                    [
                        '==',
                        'descriptivegroup1',
                        'General Surface'
                    ],
                    [
                        '==',
                        'make',
                        'Multiple'
                    ]
                ],
                'paint': {
                    'fill-color': '#fffeca',
                    'fill-outline-color': '#9a9f77'
                }
            },
            {
                'id': topography + '-rural',
                'type': 'fill',
                'source': topography,
                'source-layer': topography,
                'filter': [
                    '==',
                    'descriptivegroup1',
                    'Natural Environment'
                ],
                'paint': {
                    'fill-color': '#c9fbca',
                    'fill-outline-color': '#95bd85'
                }
            },
            {
                'id': topography + '-buildings',
                'type': 'fill',
                'source': topography,
                'source-layer': topography,
                'filter': [
                    'in',
                    'descriptivegroup1',
                    'Building',
                    'Glasshouse'
                ],
                'paint': {
                    'fill-color': '#fecb9a',
                    'fill-outline-color': '#dd8667'
                }
            },
            {
                'id': topography + '-structure',
                'type': 'fill',
                'source': topography,
                'source-layer': topography,
                'filter': [
                    '==',
                    'descriptivegroup1',
                    'Structure'
                ],
                'paint': {
                    'fill-color': '#d99669',
                    'fill-outline-color': '#6b6844'
                }
            },
            {
                'id': topography + '-water',
                'type': 'fill',
                'source': topography,
                'source-layer': topography,
                'filter': [
                    '==',
                    'descriptivegroup1',
                    'Inland Water'
                ],
                'paint': {
                    'fill-color': '#d5fffa',
                    'fill-outline-color': '#86d2d0'
                }
            },
            {
                'id': topography + '-road',
                'type': 'fill',
                'source': topography,
                'source-layer': topography,
                'filter': [
                    'in',
                    'descriptivegroup1',
                    'Road Or Track',
                    'Path'
                ],
                'paint': {
                    'fill-color': '#cccccc',
                    'fill-outline-color': '#8c8c82'
                }
            },
            {
                'id': topography + '-rail',
                'type': 'fill',
                'source': topography,
                'source-layer': topography,
                'filter': [
                    '==',
                    'descriptivegroup1',
                    'Rail'
                ],
                'paint': {
                    'fill-color': '#787878',
                    'fill-outline-color': '#222222'
                }
            },
            {
                'id': topography + '-3d-buildings',
                'type': 'fill-extrusion',
                'source': topography,
                'source-layer': topography,
                'filter': [
                    'has',
                    'abshmax'
                ],
                'paint': {
                    'fill-extrusion-color': '#fecb9a',
                    'fill-extrusion-height': [
                        '-',
                        ['get', 'abshmax'],
                        ['get', 'abshmin']
                    ],
                    'fill-extrusion-opacity': 0.8
                }
            }
        ]
    }

    whenMapStyleLoaded(func) {
        if (this.timeoutMapLoaded) {
            clearTimeout(this.timeoutMapLoaded)
        }

        const now = Date.now()
        // workaround hack from https://github.com/Eddie-Larsson/mapbox-print-pdf/issues/1
        if (this.lastRendered && this.renderer.isStyleLoaded() && now > this.lastRendered + 800 ) {
            func()
        }
        else {
            this.timeoutMapLoaded = setTimeout(() => this.whenMapStyleLoaded(func), 10)
        }
    }

    componentDidMount() {
        this.display()
    }

    componentDidUpdate(prevProps) {
        if (this.state.loaded && prevProps.topographySelected !== this.props.topographySelected) {
          this.pushSelected()
        }
    }

    render() {
        return HTML.div({ className: 'map' })
    }

}
