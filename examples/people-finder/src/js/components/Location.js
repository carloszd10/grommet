// (C) Copyright 2014-2015 Hewlett-Packard Development Company, L.P.

var merge = require('lodash/object/merge');
var React = require('react');
var IntlMixin = require('grommet/mixins/GrommetIntlMixin');
var Rest = require('grommet/utils/Rest');
var Header = require('grommet/components/Header');
var Title = require('grommet/components/Title');
var Article = require('grommet/components/Article');
var Section = require('grommet/components/Section');
var SearchIcon = require('grommet/components/icons/Search');
var Logo = require('./Logo');
var Map = require('./Map');

var LDAP_BASE = {
  url: encodeURIComponent('ldap://ldap.hp.com'),
  base: encodeURIComponent('ou=locations,o=hp.com'),
  scope: 'sub'
};

var LocationComponent = React.createClass({

  propTypes: {
    onClose: React.PropTypes.func.isRequired,
    hpRealEstateID: React.PropTypes.string.isRequired
  },

  mixins: [IntlMixin],

  getInitialState: function () {
    return {location: {}};
  },

  componentDidMount: function () {
    this._getLocation(this.props.hpRealEstateID);
  },

  componentWillReceiveProps: function (newProps) {
    if (newProps.cn !== this.props.cn) {
      this._getGroup(newProps.cn);
    }
  },

  _onLocationResponse: function (err, res) {
    if (err) {
      this.setState({location: {}, error: err});
    } else if (res.ok) {
      var result = res.body;
      this.setState({location: result[0], error: null});
    }
  },

  _getLocation: function (hpRealEstateID) {
    var params = merge({}, LDAP_BASE, {
      filter: '(hpRealEstateID=' + hpRealEstateID + ')'
    });
    Rest.get('/ldap/', params).end(this._onLocationResponse);
  },

  render: function() {
    var appTitle = this.getGrommetIntlMessage('Locations Finder');
    var loc = this.state.location;
    var address;
    if (loc.postalAddress) {
      address = loc.postalAddress.split(/ \$ /).map(function (e, index) {
        return (<div key={index}>{e}</div>);
      });
    }

    // NOTE: ED latitude and longitude aren't accurate. Removed the following from Map use:
    // latitude={loc.latitude} longitude={loc.longitude}

    return (
      <Article>
        <Header large={true} pad={{horizontal: "medium"}} separator="bottom"
          justify="between">
          <Title onClick={this.props.onClose} responsive={false}>
            <Logo />
            {appTitle}
          </Title>
          <span onClick={this.props.onClose}>
            <SearchIcon />
          </span>
        </Header>
        <Section pad="medium">
          <Header tag="h1" justify="between">
            <span>{loc.buildingName}</span>
            <span className="secondary">{loc.hpRealEstateID}</span>
          </Header>
          <address>{address}</address>
          <h3><a href={"tel:" + loc.telephoneNumber}>{loc.telephoneNumber}</a></h3>
          <p>{loc.businessCategory}</p>
        </Section>
        <Map title={loc.businessCategory || loc.buildingName}
          street={loc.street} city={loc.l} state={loc.st} country={loc.c} />
      </Article>
    );
  }

});

module.exports = LocationComponent;
