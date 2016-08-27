var React = require('react');
var ReactDOM = require('react-dom');
let imagesLoaded = require('imagesloaded')

function topPosition(domElt) {
  if (!domElt) {
    return 0;
  }
  return domElt.offsetTop + topPosition(domElt.offsetParent);
}

module.exports = function () {
  if (React.addons && React.addons.InfiniteScroll) {
    return React.addons.InfiniteScroll;
  }
  React.addons = React.addons || {};
  var InfiniteScroll = React.addons.InfiniteScroll = React.createClass({
    getDefaultProps: function () {
      return {
        pageStart: 0,
        hasMore: false,
        loadMore: function () {},
        threshold: 250,
        loader: this._defaultLoader
      };
    },
    componentDidMount: function () {
      this.attachScrollListener();
      this.scrollListener();
    },
    componentDidUpdate: function () {
      console.log(`Reattaching scroll listener because component updated itself`)
      this.attachScrollListener();
    },
    render: function () {
      var props = this.props;
      return React.DOM.div(null, props.children, props.hasMore && props.loader);
    },
    scrollListener: function () {
      console.log(`Handling scroll event`, this)
      var el = ReactDOM.findDOMNode(this);
      var scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset :
        (document.documentElement || document.body.parentNode || document.body).scrollTop;
      var delta = topPosition(el) + el.offsetHeight - scrollTop - window.innerHeight;
      if (delta < Number(this.props.threshold)) {
        console.log(`event, Scroll delta is less than threshold: ${delta}, loading more`)
        this.detachScrollListener();
        // call loadMore after detachScrollListener to allow
        // for non-async loadMore functions
        this.props.loadMore(this.props.pageStart);
        this.props.pageStart += 1;
      } else {
        console.log(`event, Scroll delta is larger than or equal to threshold: ${delta}`)
      }
    },
    attachScrollListener: function () {
      console.log(`Attaching scroll event listener`)
      if (!this.props.hasMore) {
        return;
      }

      var imageLoad = imagesLoaded(ReactDOM.findDOMNode(this))

      function handleImagesLoaded() {
        console.log('All images are loaded, listening to events')
        global.addEventListener('scroll', this.scrollListener)
        global.addEventListener('resize', this.scrollListener)
        this.scrollListener();

        imageLoad.off('always', handleImagesLoaded)
      }

      imageLoad.on('always', handleImagesLoaded.bind(this))
    },
    detachScrollListener: function () {
      console.log('event detaching scroll listener')
      global.removeEventListener('scroll', this.scrollListener);
      global.removeEventListener('resize', this.scrollListener);
    },
    componentWillUnmount: function () {
      this.detachScrollListener();
    }
  });
  InfiniteScroll.setDefaultLoader = function (loader) {
    InfiniteScroll._defaultLoader = loader;
  };
  return InfiniteScroll;
};
