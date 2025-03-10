import React, { useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { loginUser } from '../authService'; // 🔹 Importar autenticación Firebase
import './Login.css';

const Login: React.FC = () => {
    const history = useHistory();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        try {
            const user = await loginUser(email, password);
            console.log("Usuario autenticado:", user);
            alert("Inicio de sesión exitoso");
            history.replace('/home'); // 🔹 Redirigir a Home después de iniciar sesión
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error desconocido";
            console.error("Error al iniciar sesión:", errorMessage);
            alert("Error al iniciar sesión: " + errorMessage);
        }
    };

    const goToRegister = () => {
        history.replace('/register');
    };

    return (
        <IonPage>
            <IonContent className="login-container" fullscreen scrollY={false} style={{ "--background": "transparent" }}>
                <div className="login-background">
                    <h2 className="login-title">INICIO DE SESIÓN</h2>

                    <div className="input-group">
                        <input
                            type="email"
                            className="input-field"
                            placeholder="Correo"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="input-group password-container">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="input-field password-input"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <img
                                src={showPassword ? "/eye-lock-login.svg" : "/eye-login.svg"}
                                alt="Mostrar Contraseña"
                                className="password-icon"
                            />
                        </button>
                    </div>

                    <div className="button-div">
                        <button className="login-button" onClick={handleLogin}>
                            INICIAR SESIÓN
                        </button>
                    </div>

                    <p className="register-text">
                        ¿No tienes una cuenta? <span className="register-link" onClick={goToRegister}>Regístrate aquí</span>
                    </p>
                </div>

                <div className="wave-container">
                    <img src="/wave-2.svg" alt="Wave Animation" className="wave-svg" />
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Login;