import React, { useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { registerUser } from '../authService';
import './Register.css';

const Register: React.FC = () => {
    const history = useHistory();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }

        try {
            const user = await registerUser(email, password, firstName, lastName);
            console.log("Usuario registrado:", user);
            alert("Cuenta creada con éxito");
            history.replace('/login');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error desconocido";
            console.error("Error al registrar:", errorMessage);
            alert("Error al registrar: " + errorMessage);
        }
    };

    return (
        <IonPage>
            <IonContent className="register-container" fullscreen scrollY={false} style={{ "--background": "transparent" }}>
                <div className="register-background">
                    <h2 className="register-title">CREAR CUENTA</h2>

                    <div className="input-group-register">
                        <input type="text" className="input-field-register" placeholder="Nombres" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </div>

                    <div className="input-group-register">
                        <input type="text" className="input-field-register" placeholder="Apellidos" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>

                    <div className="input-group-register">
                        <input type="email" className="input-field-register" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div className="input-group-register password-container-register">
                        <input type={showPassword ? "text" : "password"} className="input-field-register password-input-register" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button type="button" className="toggle-password-register" onClick={() => setShowPassword(!showPassword)}>
                            <img src={showPassword ? "/eye-lock-login.svg" : "/eye-login.svg"} alt="Mostrar Contraseña" className="password-icon" />
                        </button>
                    </div>

                    <div className="input-group password-container">
                        <input type={showConfirmPassword ? "text" : "password"} className="input-field password-input" placeholder="Confirmar Contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            <img src={showConfirmPassword ? "/eye-lock-login.svg" : "/eye-login.svg"} alt="Mostrar Contraseña" className="password-icon" />
                        </button>
                    </div>

                    <div className="button-div">
                        <button className="login-button" onClick={handleRegister}>
                            CREAR CUENTA
                        </button>
                    </div>

                    <p className="register-text-register">
                        ¿Ya tienes una cuenta? <span className="register-link" onClick={() => history.replace('/login')}>Iniciar sesión</span>
                    </p>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Register;