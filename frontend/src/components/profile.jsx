import React from "react";
import Navbar from "./navbar"
import Sidebar from "./sidebar"
import {Link, Redirect, withRouter} from "react-router-dom";
import {makeBackendRequest, getUrlParams,} from "../util";
import EmployeeProfile from "./employee_profile"
import EmployerProfile from "./employer_profile"
import { withAuth0 } from "@auth0/auth0-react";
import { GetCurrentUserID } from "../util"

class Profile extends React.Component {
  constructor(props) {
    super(props);

    // match params from route i.e. /profile/johnsmith1 --> "johnsmith1"
    // null on /profile which will show logged-in user's profile, editable
    this.userToView = this.props.match.params.username || null;

    this.mounted = false;

    this.state = {
      currUserInfo: null,
      viewUserInfo: null,
      ready: false
    }
  }

  loadUserInfo = async () => {
    const { user } = this.props.auth0;
    console.log('important')
    console.log(user)

    let currUserInfo = null;
    if (user) {
      currUserInfo = await makeBackendRequest(
        '/api/user_info',
        { userID: user.sub }
      )
    }

    let viewUserInfo = null;
    if (this.userToView) {
      viewUserInfo = await makeBackendRequest('/api/user_info', { username: this.userToView })
    }

    console.log('before setting state!')
    if (this.mounted) {
      console.log('setting state!')
      console.log(currUserInfo)
      this.setState({
        currUserInfo: currUserInfo,
        viewUserInfo: viewUserInfo,
        ready: true
      })
    }
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

  render() {
    console.log('rendering')

    const { isAuthenticated} = this.props.auth0;

    if (isAuthenticated && !this.state.currUserInfo) {
      this.loadUserInfo();
      return null;
    }

    if (!this.state.ready) {
      console.log('unready')
      return null;
    }

    console.log('ready')

    // case 1: user visits /profile. must be authenticated, then will
    // be shown own profile
    if (!this.userToView) {
      if (!isAuthenticated) {
        return (<div>Error: must log in to view your profile</div>)
      }

      console.log('authenticated')
      console.log(this.state)

      if (this.state.currUserInfo.accountType === "employee") {
        return (<EmployeeProfile id={this.state.currUserInfo.auth0_user_id} editable={true}></EmployeeProfile>)
      } else if (this.state.currUserInfo.accountType === "employer") {
        return (<EmployerProfile id={this.state.currUserInfo.auth0_user_id} editable={true}></EmployerProfile>)
      } else {
        return (<div>Error. Please try again.</div>)
      }
    }

    // case 2: user vists (ex.) /profile/johnsmith1. will be shown
    // johnsmith1's profile, non-editable
    if (this.loading) {
      return null;
    }

    if (!this.state.viewUserInfo.accountType) {
      return (<div>Error: user {this.userToView} not found.</div>)
    }

    console.log(this.state)

    if (this.state.viewUserInfo.accountType === "employee") {
      return (<EmployeeProfile id={this.state.viewUserInfo.auth0_user_id} editable={false}></EmployeeProfile>)
    } else if (this.state.viewUserInfo.accountType === "employer") {
      return (<EmployerProfile id={this.state.viewUserInfo.auth0_user_id} editable={false}></EmployerProfile>)
    } else {
      return (<div>Error. Please try again.</div>)
    }
  }
}

export default withAuth0(Profile)
