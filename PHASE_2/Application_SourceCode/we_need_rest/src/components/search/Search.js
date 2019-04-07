import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import Home from '../home/Home';
import Summary from '../summary/Summary';
import Find from '../find/Find';

class Search extends Component {
  render() {
    return (
      <Switch>
        <Route exact path='/' component={Home}/>
        <Route path='/:summary' component={Summary}/>
        <Route path='/:id' component={Find}/>
      </Switch>
    );
  }
}

export default Search;