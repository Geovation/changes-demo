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
        this.add = this.add.bind(this)
        this.style = this.style.bind(this)
        this.show = this.show.bind(this)
    }

    display() {
        const sources = {
            'terrain': {
                type: 'raster-dem',
                tiles: ['https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.pngraw?access_token=']
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
            this.props.topographyList.map(this.add)
            this.show(this.props.topographySelected)
            this.setState({ loaded: true })
        })
    }

    add(topography) {
        this.renderer.addSource(topography, {
            type: 'vector',
            tiles: [window.location.href + topography + '/{z}/{x}/{y}.pbf']
        })
        this.style(topography).forEach(layer => {
            this.renderer.addLayer(layer)
            this.renderer.setLayoutProperty(layer.id, 'visibility', 'none')
            this.renderer.moveLayer('hillshading')
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

    show(id) {
        const topography = this.props.topographyList[id]
        const current = this.style(topography).map(layer => layer.id)
        const previous = Object.keys(this.renderer.style._layers).filter(layer => {
            return !current.concat(['background', 'hillshading']).includes(layer)
        })
        current.forEach(id => {
            this.renderer.setLayoutProperty(id, 'visibility', 'visible')
        })
        setTimeout(() => { // add a short delay to ensure new topography is loaded first
            previous.forEach(id => {
                this.renderer.setLayoutProperty(id, 'visibility', 'none')
            })
        }, 1 * 1000)
    }

    componentDidMount() {
        this.display()
    }

    componentDidUpdate(prevProps) {
        if (this.state.loaded && prevProps.topographySelected !== this.props.topographySelected) {
            this.show(this.props.topographySelected)
        }
    }

    render() {
        return HTML.div({ className: 'map' })
    }

}
