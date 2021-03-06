import React from "react";

import { withAuth0 } from "@auth0/auth0-react";
import { makeBackendRequest } from "../util"
import LoginButton from "./login_button"
import LogoutButton from "./logout_button"
import {Link} from "react-router-dom";

// based on example in Auth0 Documentation

class AuthenticationButton extends React.Component {
  constructor(props) {
    super(props);

    this.mounted = false;

    this.state = {
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
    if (user) {
      userInfo = await makeBackendRequest('/api/user_info', {userID:user.sub})
    }
    if (this.mounted) {
      this.setState({
        userInfo: userInfo,
        ready: !isLoading
      })
    }
  }

  async componentDidMount() {
    this.mounted = true;
    await this.load()
  };

  componentWillUnmount() {
    this.mounted = false;
  }

  createButtons = (isAuthenticated) => {
    if (isAuthenticated) {
      return (<div>
        <LogoutButton redirectUri={window.location.href}></LogoutButton>
        <a href="\profile">
          <button className="btn btn-primary btn-block">Go to Profile</button>
        </a>
        <Link to="/favorites">
          <button className="btn btn-primary btn-block">View Favorites</button>
        </Link>
      </div>)
    } else {
      const style = {
          backgroundColor:"#A96562",
          width:'80px',
          padding:'15px 2px',
          marginRight: '20px',
          marginLeft: '0px',
          fontSize: '12pt',
          flexGrow: '0'
      };
      return (<LoginButton style={style} redirectUri={`${window.location.origin}/profile`}></LoginButton>)
    }
  }

  showUser = () => {
    if (this.state.userInfo) {
      return (<div>
        <div>Account type: {this.state.userInfo.account_type}</div>
        <div>Username: {this.state.userInfo.username}</div>
      </div>)
    } else {
      return (<div></div>)
    }
  }

  render() {
    const { isAuthenticated } = this.props.auth0;

    if (!this.state.ready) {
      return (<div>Loading...</div>);
    }

    if (isAuthenticated && !this.state.userInfo && !this.state.userInfo.account_type) {
      return (<div>Error: please try again.</div>);
    }

    return (<div>
      {this.createButtons(isAuthenticated)}
     </div>);
   }
};

export default withAuth0(AuthenticationButton);
