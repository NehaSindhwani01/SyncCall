import "../App.css"
import { Link } from "react-router-dom";

function LandingPage() {
    return (
        <div className="landingPageContainer">
            <nav>
                <div className="navHeader">
                    <h2>SyncCall</h2>
                </div>
                <div className="navList">
                    <p>Join as Guest</p>
                    <p>Register</p>
                    <Link to="/login" className="navLink">
                        Login
                    </Link>
                </div>
            </nav>

            <div className="landingMainContainer">
                <div className="">
                    <h1><span style={{color : "#FF9839"}}>Connect</span> with your loved ones.</h1>
                    <p>Cover a distance by SyncCall</p>
                    <div role="button">
                        <Link to="/auth">
                            Get started
                        </Link>
                    </div>
                </div>
                <div>
                    <img src="/mobile.png" alt=""></img>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;