var isBrowser = typeof window !== 'undefined';
var React = require('react');
var ReactDOM = require('react-dom');

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
      this.attachScrollListener();
    },
    render: function () {
      var props = this.props;
      return React.DOM.div(null, props.children, props.hasMore && props.loader);
    },
    scrollListener: function () {
      var el = ReactDOM.findDOMNode(this);
      var scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset :
        (document.documentElement || document.body.parentNode || document.body).scrollTop;
      var delta = topPosition(el) + el.offsetHeight - scrollTop - window.innerHeight;
      if (delta < Number(this.props.threshold)) {
        this.detachScrollListener();
        // call loadMore after detachScrollListener to allow
        // for non-async loadMore functions
        this.props.loadMore(this.props.pageStart);
        this.props.pageStart += 1;
      }
    },
    attachScrollListener: function () {
      if (!isBrowser) {
        return;
      }

      if (!this.props.hasMore) {
        return;
      }

      global.addEventListener('scroll', this.scrollListener);
      global.addEventListener('resize', this.scrollListener);
      this.scrollListener();
    },
    detachScrollListener: function () {
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
