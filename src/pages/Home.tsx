import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import './Home.css';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonContent className="home-container">
        <h1 className="title">HabitFlow</h1>
        <img src="/Healthy lifestyle-bro.svg" alt="HabitFlow Illustration" className="illustration" />
        <button className="login-button">INICIAR SESIÓN</button>
        <div className="wave" />
      </IonContent>
    </IonPage>
  );
};

export default Home;