import React from 'react'
import HTML from 'react-dom-factories'
import Header from 'components/header/header.js'
import Footer from 'components/footer/footer.js'
import Map from 'components/map/map.js'

const LOOP_INTERVAL = 2 * 1000

export default class MainPage extends React.Component {

    constructor() {
        super()
        this.state = {
            centre: null,
            zoom: null,
            topographyList: null,
            topographySelected: 0,
            playing: false
        }
        this.setup = this.setup.bind(this)
        this.togglePlay = this.togglePlay.bind(this)
        this.setSelected = this.setSelected.bind(this)
        this.loop = this.loop.bind(this)
        this.itIsStillRendering = false

        this.setItIsStillRendering = itIsStillRendering => this.itIsStillRendering = itIsStillRendering

        // used for the setInterval
        this.loopIntervalId
    }

    setup() {
        const centre = [-1.8231, 51.5989]
        const zoom = 14.44
        const topographyList = [
            { data: 'topography/9022-SU1085-5c963',    title: 'October 2004' },
            { data: 'topography/10277-SU1085-5c963',   title: 'January 2005' },
            { data: 'topography/12290-SU1085-5c963',   title: 'April 2005' },
            { data: 'topography/14970-SU1085-5c963',   title: 'July 2005' },
            { data: 'topography/18275-SU1085-5c963',   title: 'September 2005' },
            { data: 'topography/20245-SU1085-5c963',   title: 'December 2005' },
            { data: 'topography/22094-SU1085-5c963',   title: 'February 2006' },
            { data: 'topography/24278-SU1085-5c963',   title: 'May 2006' },
            { data: 'topography/26934-SU1085-5c963',   title: 'August 2006' },
            { data: 'topography/29428-SU1085-5c963',   title: 'November 2006' },
            { data: 'topography/32828-SU1085-5c963',   title: 'January 2007' },
            { data: 'topography/35759-SU1085-5c963',   title: 'April 2007' },
            { data: 'topography/38700-SU1085-5c963',   title: 'August 2007' },
            { data: 'topography/40707-SU1085-5c963',   title: 'October 2007' },
            { data: 'topography/42758-SU1085-5c963',   title: 'December 2007' },
            { data: 'topography/45014-SU1085-5c963',   title: 'March 2008' },
            { data: 'topography/47332-SU1085-5c963',   title: 'June 2008' },
            { data: 'topography/49672-SU1085-5c963',   title: 'September 2008' },
            { data: 'topography/51973-SU1085-5c963',   title: 'December 2008' },
            { data: 'topography/54251-SU1085-5c963',   title: 'March 2009' },
            { data: 'topography/56724-SU1085-5c963',   title: 'May 2009' },
            { data: 'topography/58968-SU1085-5c963',   title: 'August 2009' },
            { data: 'topography/61530-SU1085-5c963',   title: 'November 2009' },
            { data: 'topography/63961-SU1085-5c963',   title: 'February 2010' },
            { data: 'topography/66380-SU1085-5c963',   title: 'April 2010' },
            { data: 'topography/68990-SU1085-5c963',   title: 'July 2010' },
            { data: 'topography/71559-SU1085-5c963',   title: 'October 2010' },
            { data: 'topography/73696-SU1085-5c963',   title: 'January 2011' },
            { data: 'topography/78419-SU1085-5c963',   title: 'March 2011' },
            { data: 'topography/81057-SU1085-5c963',   title: 'June 2011' },
            { data: 'topography/83216-SU1085-5c963',   title: 'September 2011' },
            { data: 'topography/86223-SU1085-5c963',   title: 'December 2011' },
            { data: 'topography/88533-SU1085-5c963',   title: 'March 2012' },
            { data: 'topography/90674-SU1085-5c963',   title: 'June 2012' },
            { data: 'topography/92000-SU1085-5c963',   title: 'August 2012' },
            { data: 'topography/93434-SU1085-5c963',   title: 'October 2012' },
            { data: 'topography/94431-SU1085-5c963',   title: 'November 2012' },
            { data: 'topography/95320-SU1085-5c963',   title: 'January 2013' },
            { data: 'topography/95704-SU1085-5c963',   title: 'February 2013' },
            { data: 'topography/95928-SU1085-5c963',   title: 'March 2013' },
            { data: 'topography/96154-SU1085-5c963',   title: 'May 2013' },
            { data: 'topography/1338957-SU1085-5c963', title: 'June 2013' },
            { data: 'topography/1357616-SU1085-5c963', title: 'August 2013' },
            { data: 'topography/1373155-SU1085-5c963', title: 'September 2013' },
            { data: 'topography/1389938-SU1085-5c963', title: 'October 2013' },
            { data: 'topography/1425147-SU1085-5c963', title: 'January 2014' },
            { data: 'topography/1441974-SU1085-5c963', title: 'February 2014' },
            { data: 'topography/1462490-SU1085-5c963', title: 'April 2014' },
            { data: 'topography/1485053-SU1085-5c963', title: 'May 2014' },
            { data: 'topography/1508581-SU1085-5c963', title: 'July 2014' },
            { data: 'topography/1548350-SU1085-5c963', title: 'September 2014' },
            { data: 'topography/1592959-SU1085-5c963', title: 'December 2014' }
        ]
      this.setState({ centre, zoom, topographyList })
      this.togglePlay()
    }

    togglePlay(state) {
        const playing = state !== undefined ? state : !this.state.playing
        this.setState({ playing })
    }

    setSelected(i) {
        this.setState({ topographySelected: i })
    }

    loop() {
        const next = this.state.topographySelected < this.state.topographyList.length - 1 ? this.state.topographySelected + 1 : 0
        if (!this.itIsStillRendering) {
          this.itIsStillRendering = true
          this.setState({ topographySelected: next })
        }
    }

    componentDidMount() {
        this.setup()
    }

    componentDidUpdate(_, prevState) {
      clearInterval(this.loopIntervalId)
      if (this.state.playing) {
        this.loopIntervalId = setInterval(this.loop, LOOP_INTERVAL)
      }
    }

    render() {
        if (!this.state.topographyList) return HTML.div({ className: 'loading' })
        return HTML.div({ className: 'main-page' }, ...[
            React.createElement(Header),
            React.createElement(Map, {
                centre: this.state.centre,
                zoom: this.state.zoom,
                topographyList: this.state.topographyList,
                topographySelected: this.state.topographySelected,
                setItIsStillRendering: this.setItIsStillRendering
            }),
            React.createElement(Footer, {
                play: this.togglePlay,
                playing: this.state.playing,
                set: this.setSelected,
                value: this.state.topographySelected,
                title: this.state.topographyList[this.state.topographySelected].title,
                total: this.state.topographyList.length
            })
        ])
    }

}
