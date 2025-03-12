import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const history = useHistory();

  const goToLogin = () => {
    history.replace('/login');
  };

  return (
    <IonPage>
      <IonContent className="home-container" fullscreen>
        <div className="content-wrapper">
          <h1 className="title">HabitFlow</h1>
          <img src="/Healthy lifestyle-bro.svg" alt="HabitFlow Illustration" className="illustration" />

          <button className="login-button" onClick={goToLogin}>
            INICIAR SESIÓN
          </button>
          <div className="wave-container">
            <img src="/wave-main.svg" alt="Wave Animation" className="wave-main-svg" />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;