import React from "react";
import ProfileView from "./profile_view";
import {Link} from "react-router-dom";
import { withAuth0 } from "@auth0/auth0-react";
import "./profile.css"

class EmployerProfile extends React.Component {
  render() {
    return (<ProfileView showProfile={this.showProfile} {...this.props} category="company"></ProfileView>)
  }

  showProfile(ref) {
    function createJobsButton() {
      let linkURL;
      if (ref.props.editable) {
        linkURL = "/jobs"
      } else {
        linkURL = `/jobs/${ref.state.viewUserInfo.username}`
      }
      return (<Link to={linkURL}><button>Jobs</button></Link>)
    }

    return (
      <div id="profile">
          <div id="top-section">
              <h2>{ref.state.viewUserInfo.name}</h2>

              <img src={ref.state.viewUserInfo.profile_img_url} id="profile-image" alt="Profile Image"/>

                {ref.createEditButton()}
                {ref.createFavoritesButtons()}
          </div>
          <div id="bottom-section">
              {createJobsButton()}
              <a href={ref.state.viewUserInfo.website_url} target="_blank">
                <button>Website</button>
              </a>
              <a href={`mailto:${ref.state.viewUserInfo.email}`}>
                <button>Contact</button>
              </a>


              <h3>About: </h3>
              <p>{ref.state.viewUserInfo.about}</p>

              <h3>Logistics: </h3>
              <p>{ref.state.viewUserInfo.logistics}</p>

              <h3>Location: </h3>
              <p>{ref.state.viewUserInfo.location}</p>
          </div>
      </div>
    )
  }
}

export default withAuth0(EmployerProfile)
