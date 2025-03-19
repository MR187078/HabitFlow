import { IonApp, IonRouterOutlet } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route, Redirect, Switch } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddHabit from "./pages/AddHabit";
import HabitView from "./pages/HabitView";
import Timer from "./pages/Timer";
import Streakview from "./pages/Streakview";

const App: React.FC = () => {
  const [, setUser] = useState<User | null>(null);
  const [, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Switch>
            <Route exact path="/home" component={Home} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/dashboard" component={Dashboard} />
            <Route exact path="/addhabit" component={AddHabit} />
            <Route exact path="/habitview/:id" component={HabitView} />
            <Route exact path="/timer/:id" component={Timer} />
            <Route exact path="/Streakview" component={Streakview} />
            <Route path="*">
              <Redirect to="/home" />
            </Route>
          </Switch>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;