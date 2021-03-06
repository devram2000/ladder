import React from "react";
import Navbar from "./navbar"
import Sidebar from "./sidebar"
import EmployeeProfile from "./employee_profile"
import EmployerProfile from "./employer_profile"
import {makeBackendRequest} from "../util"
import { withAuth0 } from "@auth0/auth0-react";
import JobView from "./job_view"


class Favorites extends React.Component {
  constructor(props) {
    super(props);

    this.mounted = false;

    this.state = {
      category: "job",
      favorites: [],
      userInfo: null,
      ready: false
    }
  }

  load = async () => {
    const { user, isLoading } = this.props.auth0;

    if (isLoading) {
      setTimeout(this.load, 100)
      return;
    }

    if (this.state.ready) {
      return;
    }

    let userInfo = null;
    let favorites = []
    if (user) {
      userInfo = await makeBackendRequest(
        '/api/user_info',
        { userID: user.sub }
      )

      favorites = await this.getFavorites(this.state.category)
    }

    if (this.mounted) {
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
      favorites = await makeBackendRequest('/api/favorites', {
        userID: user.sub,
        category: category
      })
    }

    return favorites
  }


  async componentDidMount() {
    this.mounted = true;
    await this.load();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  displayPreview = (entry) => {
    if (this.state.category === "employee") {
      return (<div>
        <h3>{entry.name || "[Name unavailable]"}</h3>
        <h4>{entry.category || "[Category unavailable]"}</h4>
        <h4>{entry.location || "[Location unavailable]"}</h4>
      </div>)
    } else if (this.state.category === "job") {
      return (<div>
        <h3>{entry.job_title || "[Job title unavailable]"}</h3>
        <h4>{entry.name || "[Employer unavailable]"}</h4>
        <h4>{entry.location || "[Location unavailable]"}</h4>
      </div>)
    } else if (this.state.category === "company") {
      return (<div>
        <h3>{entry.name || "[Name unavailable]"}</h3>
        <h4>{entry.location || "[Location unavailable]"}</h4>
      </div>)
    } else {
      return null;
    }
  }

  displayEntry = (entry, deleteFn) => {
    if (this.state.category === "employee") {
      return (<EmployeeProfile key={entry.auth0_user_id} id={entry.auth0_user_id} editable={false} deleteFromSidebar={deleteFn}></EmployeeProfile>)
    } else if (this.state.category === "job") {
      return (<div>
        {<JobView key={entry.job_id} job_id={entry.job_id} editable={false} deleteFromSidebar={deleteFn}></JobView>}
      </div>)
    } else if (this.state.category === "company") {
      return (<EmployerProfile key={entry.auth0_user_id} id={entry.auth0_user_id} editable={false} deleteFromSidebar={deleteFn}></EmployerProfile>)
    } else {
      return null;
    }
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

    if (!this.state.ready) {
      return (<div>Loading...</div>);
    }

    if (isAuthenticated && !this.state.userInfo && !this.state.userInfo.account_type) {
      return (<div>Error: please try again.</div>);
    }

    if (!isAuthenticated) {
      return (<div>Error: must be logged in to view your favorites.</div>)
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
      <Sidebar key={this.state.category} entries={this.state.favorites} displayPreview={this.displayPreview} displayEntry={this.displayEntry}
        ifEmpty={null}></Sidebar>
    </div>)
  }
}

export default withAuth0(Favorites)
