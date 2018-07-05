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
        this.previous = []
    }

    display = () => {
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
                    'background-color': '#444',
                }
            },
            {
                id: 'hillshading',
                type: 'hillshade',
                source: 'terrain',
                paint: {
                    'hillshade-exaggeration':0.1,
                }
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
        this.renderer.on('load', () => {
            this.props.topographyList.map(this.add)
            this.show(this.props.topographySelected)
            this.setState({ loaded: true })
            this.renderer.moveLayer('hillshading')
        })

        this.renderer.on('sourcedata', (e) => {
          if(e.isSourceLoaded ){
            this.previous.forEach(id => this.renderer.setLayoutProperty(id, 'visibility', 'none'))
            this.props.setItIsStillRendering(false)
          }
        })
    }

    add = (topography) => {
        this.renderer.addSource(topography.data, {
            type: 'vector',
            tiles: [window.location.href + topography.data + '/{z}/{x}/{y}.pbf']
        })
        this.style(topography.data).forEach(layer => {
            this.renderer.addLayer(layer)
            this.renderer.setLayoutProperty(layer.id, 'visibility', 'none')
            this.renderer.moveLayer('hillshading')
        })
    }

    style = (topography) => {
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
                }
            }
        ]
    }

    show = (id) => {
        const topography = this.props.topographyList[id]
        const current = this.style(topography.data).map(layer => layer.id)

        this.previous = Object.keys(this.renderer.style._layers).filter(layer => {
            return !current.concat(['background', 'hillshading']).includes(layer)
        })
        current.forEach(id => {
            this.renderer.setLayoutProperty(id, 'visibility', 'visible')
        })
    }

    componentDidMount() {
        this.display()
    }

    componentDidUpdate(prevProps) {
        if (this.state.loaded && prevProps.topographySelected !== this.props.topographySelected) {
            this.show(this.props.topographySelected)
        }
    }

    componentWillUnmount() {
       this.renderer.remove();
     }

    render() {
        return HTML.div({ className: 'map' })
    }

}
