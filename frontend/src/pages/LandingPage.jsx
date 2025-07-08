import "../App.css"
import { Link, useNavigate } from "react-router-dom";

function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landingPageContainer">
            <nav>
                <div className="navHeader">
                    <h2>SyncCall</h2>
                </div>
                <div className="navList">
                    <p onClick={() =>  navigate("/q23qsc")}>Join as Guest</p>
                    <p onClick={() => navigate("/auth", { state: { mode: "signup" } })}>Register</p>
                    <p onClick={() => navigate("/auth", { state: { mode: "login" } })}>Login</p>
                </div>
            </nav>

            <div className="landingMainContainer">
                <div>
                    <h1><span style={{ color: "#FF9839" }}>Connect</span> with your loved ones.</h1>
                    <p>Cover a distance by SyncCall</p>
                    <div role="button">
                        <Link to="/auth">
                            Get started
                        </Link>
                    </div>
                </div>
                <div>
                    <img src="/mobile.png" alt="" />
                </div>
            </div>
        </div>
    );
}

export default LandingPage;
