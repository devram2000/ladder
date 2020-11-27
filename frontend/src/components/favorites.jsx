import React from "react";
import Navbar from "./navbar"
import Sidebar from "./sidebar"
import {Link, Redirect, withRouter} from "react-router-dom";
import {makeBackendRequest, getUrlParams,} from "../util"
import { withAuth0 } from "@auth0/auth0-react";

class Favorites extends React.Component {
  constructor(props) {
    super(props);

    this.mounted = false;

    this.state = {
      category: "job",
      currSelectedIndex: 0,
      favorites: [],
      userInfo: null,
      ready: false
    }
  }

  loadUserInfo = async () => {
    const { user, isLoading } = this.props.auth0;

    let userInfo = null;
    let favorites = []
    if (user) {
      userInfo = await makeBackendRequest(
        '/api/user_info',
        { userID: user.sub }
      )

      favorites = await this.getFavorites(this.state.category)
    }

    console.log(userInfo)

    if (this.mounted) {
      console.log('setting state!')
      this.setState({
        userInfo: userInfo,
        favorites: favorites,
        ready: !isLoading
      })
    }
  }

  getFavorites = async (category) => {
    const { user } = this.props.auth0;
    let favorites = []

    if (user) {
      favorites = await makeBackendRequest(
        '/api/favorites',
        { userID: user.sub, category: category }
      )
    }

    console.log('got favorites:')
    console.log(favorites)
    return favorites
  }


  async componentDidMount() {
    console.log('didMount')
    this.mounted = true;
    await this.loadUserInfo();
  }

  componentWillUnmount() {
    console.log('unmount')
    this.mounted = false;
  }

  displaySelection = (index) => {
    this.setState({currSelectedIndex: index})
  }

  displayPreview = (entry) => {
    return (<div>[Sidebar entry] {JSON.stringify(entry)}</div>)
  }

  switchType = async (event) => {
    const category = event.target.value;
    const favorites = await this.getFavorites(category)

    this.setState({
      category: category,
      favorites: favorites
    })
  }

  render() {
    const { isAuthenticated } = this.props.auth0;

    if (isAuthenticated && !this.state.userInfo) {
      this.loadUserInfo();
      return null;
    }

    if (!this.state.ready) {
      return null;
    }

    if (!this.state.userInfo) {
      return null;
    }

    if (!isAuthenticated) {
      return (<div>Error: must log in to view your favorites</div>)
    }

    return (<div>
      <Navbar></Navbar>
      <h2>Favorites</h2>
      <label htmlFor="favoritesType">Favorites category:</label>
        <select name="favoritesType" id="favoritesType" onChange={this.switchType} value={this.state.category}>
          <option value="employee">employee</option>
          <option value="job">job</option>
          <option value="company">company</option>
        </select>
      <Sidebar entries={this.state.favorites} displayPreview={this.displayPreview} onSelect={this.displaySelection}></Sidebar>
      <div className="border">[Current selected index: {this.state.currSelectedIndex}] Item: {JSON.stringify(this.state.favorites[this.state.currSelectedIndex])}</div>
    </div>)
  }
}

export default withAuth0(Favorites)
