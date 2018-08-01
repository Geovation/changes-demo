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
                tiles: [window.location.href + 'terrain/{z}/{x}/{y}.png'],
                minzoom: 12,
                maxzoom: 16,
                bounds: [ -1.8621825, 51.5635,-1.7798, 51.61119 ]
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
            maxZoom: 18
        })
        this.renderer.on('load', () => {
            this.props.topographyList.map(this.add)
            this.show(this.props.topographySelected)
            this.setState({ loaded: true })
        })
    }

    add = (topography) => {
        this.renderer.addSource(topography.data, {
            type: 'vector',
            tiles: [window.location.href + topography.data + '/{z}/{x}/{y}.pbf']
        })
        this.style(topography.data).forEach(layer => {
            this.renderer.addLayer(layer)
            if(layer.id!==topography.data+'-3d-buildings' && layer.id!==topography.data+'-road') {
              this.renderer.moveLayer(layer.id,'hillshading')
            }
            this.renderer.setLayoutProperty(layer.id, 'visibility', 'none')
        })
    }

    style = (topography) => {
        return [
            {
                'id': topography + 'generic',
                'type': 'fill',
                'source': topography,
                'source-layer': topography,
                'paint': {
                  'fill-color': [
                      'match',
                      ['get', 'descriptivegroup1'],
                      [
                          'General Surface',
                          'Landform',
                          'Roadside'
                      ], '#c7fda0',
                      ['Unclassified'],'#cbcc99',
                      ['Natural Environment'],'#c9fbca',
                      [
                          'Building',
                          'Glasshouse'
                      ],'#fecb9a',
                      ['Structure'],'#d99669',
                      ['Inland Water'],'#d5fffa',
                      [
                          'Road Or Track',
                          'Path'
                      ],'#cccccc',
                      ['Rail'],'#787878',
                      'black'
                  ],
                  'fill-outline-color':[
                      'match',
                      ['get', 'descriptivegroup1'],
                      [
                          'General Surface',
                          'Landform',
                          'Roadside'
                      ], '#87b36a',
                      ['Unclassified'],'#7a9068',
                      ['Natural Environment'],'#95bd85',
                      [
                          'Building',
                          'Glasshouse'
                      ],'#dd8667',
                      ['Structure'],'#6b6844',
                      ['Inland Water'],'#86d2d0',
                      [
                          'Road Or Track',
                          'Path'
                      ],'#8c8c82',
                      ['Rail'],'#222222',
                  '#444'
                  ],
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
                'id': topography + '-3d-buildings',
                'type': 'fill-extrusion',
                'source': topography,
                'source-layer': topography,
                'filter': [
                    'has',
                    'height'
                ],
                'paint': {
                    'fill-extrusion-color': '#fecb9a',
                    'fill-extrusion-height': ['get', 'height']
                }
            }
        ]
    }

    show = (id) => {
        const topography = this.props.topographyList[id]
        const current = this.style(topography.data).map(layer => layer.id)
        const previous = Object.keys(this.renderer.style._layers).filter(layer => {
            return !current.concat(['background', 'hillshading']).includes(layer)
        })
        current.forEach(id => {
            this.renderer.setLayoutProperty(id, 'visibility', 'visible')
        })
        this.whenMapStyleLoaded(() => {
            this.props.setItIsStillRendering(false)
            previous.forEach(id => {
                this.renderer.setLayoutProperty(id, 'visibility', 'none')
            })
        })
    }

    whenMapStyleLoaded(func) {
        if (this.requestFrame) {
            cancelAnimationFrame(this.requestFrame)
        }
        if (this.renderer.isStyleLoaded()) {
          func()
        }
        else {
            this.requestFrame = requestAnimationFrame(()=>this.whenMapStyleLoaded(func))
        }
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
