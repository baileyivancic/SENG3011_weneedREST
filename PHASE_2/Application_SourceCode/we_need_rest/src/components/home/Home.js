import React, { Component } from 'react';
import './Home.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

const input = (search_param, updateState) => {
  const doc = {
    n : ["e.g. 7", "Max number of results"],
    latitude : ["e.g. 211442.78", "Latitude of area affected"],
    longitude : ["e.g. 3032.12", "Longitude of area affected"],
    key_terms : ["e.g. Malaria, Zika", "List of key terms"],
    start_date : ["e.g. 2018-12-10T23:50:00", "Start date of date range"],
    end_date : ["e.g. 2018-12-10T23:50:00", "End date of date range "]
  };

  return (
  <div key={search_param} className="form-group">
    <p className="text-dark">{doc[search_param][1]}</p>
    <input onChange={()=>{updateState(search_param)}} id={search_param} type="text" className="form-control" placeholder={doc[search_param][0]}/>
  </div>
  );
};

function Modal(props) {
  const search_params = props.value;

  const toggleModal = ()=>{
    const modal = document.querySelector("#modal");
    modal.classList.toggle("closed");
  }

  return (
    <div id="modal" className="closed">
      <div className="modal-header">
        <h5 className="modal-title">Filter Reports</h5>
        <button onClick={()=>{toggleModal()}} type="button" className="btn-outline-dark"> X </button>
      </div>
      <form id="modal-form" className="form">
        { search_params.map(search_param => input(search_param, props.updateState)) }
        <button onClick={()=>{props.handleSubmitFilter(); toggleModal()}} type="submit" className="btn btn-primary">Search</button>
      </form>
    </div>
  );
}

function SearchGroup() {
  const toggleModal = ()=>{
    const modal = document.querySelector("#modal");
    modal.classList.toggle("closed");
  }

  return (
    <div className="container">
      <div className="row">
        <div className="input-group">
          <input type="text" className="form-control"/>
          <button onClick={()=>{toggleModal()}} id="open-button" type="button" className="btn btn-default dropdown-toggle"><span className="caret"></span></button>
        </div>
      </div>
    </div>
  );
}

const articles = article => {
  const handleDelete = (id) => {
    axios.delete('http://46.101.226.130:5000/reports/'+id); 
    const elem = document.querySelector("#item"+id);
    elem.className = 'editing';
  }
  return (
    <div id={'card'+article.id} className="card text-white bg-dark mb-3">
      <div className="card-header">
        {article.headline}
        <button onClick={ () => {handleDelete(article.id)} } className="destroy"></button>
        <p style={{align:"right"}}><button>View Report</button></p>
      </div>
      <div className="card-body" id="body-card">
        <h5 className="card-title">{article.id}</h5>
        <p className="card-text">{article.main_text}</p>
        <p className="card-text">{new Date(article.date_of_publication).toDateString()}</p>
      </div>
    </div>
  )
};


class Home extends Component {
  constructor(props) {
    super(props)

    this.state = {
      response: undefined,
      selectedArticles: [],
      n : undefined,
      latitude : undefined,
      longitude : undefined,
      key_terms : undefined,
      start_date : undefined,
      end_date : undefined
    }

    this.updateState = this.updateState.bind(this);
    this.handleSubmitFilter = this.handleSubmitFilter.bind(this);
    this.selectAll = this.selectAll.bind(this);
  }

  updateState(key) {
    const elem = document.getElementById(key);
    let obj = {};
    obj[key] = elem.value;
    this.setState(obj);
  }

  componentWillMount() {
    axios.get('http://46.101.226.130:5000/reports/')
      .then(res => {
        res.data.forEach( obj => delete obj['reports']);       
        this.setState({response: res})
      })
  }

  selectAll() {
    axios.get('http://46.101.226.130:5000/reports/')
      .then(res => {
        console.log(this);
        for (var i = 0; i < res.data.length; i++) {
          this.state.selectedArticles.push(res.data[i].id);
          
        }       
        this.setState({response: res})
      })
  }

  // Need to change - Duplicates currently allowed (Breaking when I change it to a set)
  select(report) {
    //Adds item to array
    let temp = this.state.selectedArticles;
    if (temp.filter(i => i==report).length !== 0) {
      console.log("Already here")
      return null
    }
    temp.push(report);
    this.setState({selectedArticles: temp});
    console.log(this.state.selectedArticles);

    //add styling
    let elem = document.getElementById('card'+report);
    elem.className = 'card bg-light mb-3';
  }

  deselect(report) {
    //Adds item to array
    let temp = this.state.selectedArticles;
    if (!(temp.filter(i => i===report).length !== 0)) {
      console.log("Not here");
      return null
    }

    for( var i = 0; i < temp.length; i++){ 
      if ( temp[i] === report) {
        temp.splice(i, 1); 
        i--;
      }
   }

    this.setState({selectedArticles: temp});
    console.log(this.state.selectedArticles);

    //add styling
    let elem = document.getElementById('card'+report);
    elem.className = 'card text-white bg-dark mb-3';
  }

  handleSubmitFilter() {
    const params = {
      n : this.state.n,
      latitude : this.state.latitude,
      longitude : this.state.longitude,
      key_terms : this.state.key_terms,
      start_date : this.state.start_date,
      end_date : this.state.end_date
    }

    //Deletes null fields
    Object.keys(params).forEach((key) => (params[key] === undefined) && delete params[key]);

    console.log(params);

    axios.get('http://46.101.226.130:5000/reports/', {params})
      .then(res => {
        res.data.forEach( obj => delete obj['reports']);
        this.setState({response: res})
      })
  }

  render() {
    const search_params = ['n', 'longitude', 'latitude', 'start_date', 'end_date', 'key_terms'];
    let data = this.state.response ? this.state.response.data : [];

    data.sort( (a, b) => new Date(b.date_of_publication) - new Date(a.date_of_publication) )

    return (
      <div>
        <h1 className="title">Sleepy API</h1>
        <SearchGroup/>
        <Modal value={ search_params } updateState={this.updateState} handleSubmitFilter={this.handleSubmitFilter}/>
        <div class="btn-group">
          <button type="button" className="btn btn-secondary" onClick={this.selectAll} id="selectAllBtn">Select All</button>
          <Link to={`/summary/${this.state.selectedArticles}`}>
            <button type="submit" className="btn btn-primary" id="summaryBtn">Get Summary</button>
          </Link>
        </div>
        <hr/>
        <div id="results">
          <ul>
            { data.map(article => <li id={"item"+article.id} onClick={() => { if(this.state.selectedArticles.includes(article.id)) {
              this.deselect(article.id);
             }
             else this.select(article.id)}} key={article.id}>{articles(article)}</li>) }
          </ul>
        </div>
      </div>
    );
  }
}

export default Home;