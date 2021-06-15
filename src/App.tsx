import React from "react";
import { Route, Switch } from "react-router-dom";

import Home from "./components/pages/Home";
import AutoLoader from "./components/pages/AutoLoader";

function App() {
    return (
        <div className="App">
            <Switch>
                <Route exact path={`/`} component={Home} />
                <Route path={"/replays/:replayId"} component={AutoLoader} />
            </Switch>
        </div>
    );
}

export default App;
