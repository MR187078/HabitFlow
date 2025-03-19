import React, { useCallback, useEffect, useState } from "react";
import { IonPage, IonContent, IonSpinner } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import "./Streakview.css"; // Asegúrate de importar el archivo CSS

const Streakview: React.FC = () => {
    const history = useHistory();
    const [menuOpen, setMenuOpen] = useState(false);
    const [streak, setStreak] = useState<number>(0);
    const [initializing, setInitializing] = useState(true);
    const [completedDays, setCompletedDays] = useState<boolean[]>(new Array(7).fill(false));

    // Función para obtener la racha del usuario
    const fetchStreak = useCallback(async (uid: string) => {
        try {
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const data = userSnap.data();
                setStreak(data?.streak || 0);

                // Simulación de días completados (esto debería venir de la base de datos)
                const daysCompleted = [true, true, false, false, false, false, false]; // Ejemplo
                setCompletedDays(daysCompleted);
            }
        } catch (error) {
            console.error("Error al obtener la racha:", error);
        }
    }, []);

    // Escucha el estado de autenticación
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                window.location.replace("/login");
            } else {
                fetchStreak(user.uid);
            }
            setInitializing(false);
        });
        return () => unsubscribe();
    }, [fetchStreak]);

    // Función para cerrar sesión
    const logoutUser = async () => {
        try {
            await signOut(auth);
            setMenuOpen(false);
            setTimeout(() => {
                history.replace("/home");
            }, 500);
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    // Mientras se define el estado de autenticación, muestra un spinner
    if (initializing) {
        return (
            <IonPage>
                <IonContent className="sv-container" fullscreen>
                    <div className="sv-loading-container">
                        <IonSpinner name="crescent" />
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            {menuOpen && (
                <div className="sv-menu-overlay">
                    <div className="sv-menu-content">
                        <button className="sv-close-menu" onClick={() => setMenuOpen(false)}>
                            ✖
                        </button>
                        <h3>Menú</h3>
                        <button className="sv-logout-button" onClick={logoutUser}>
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            )}

            <IonContent className="sv-container" fullscreen>
                <div className="sv-navbar">
                    <button className="sv-menu-toggle" onClick={() => setMenuOpen(true)}>
                        <img src="/menu-black.svg" alt="Menú" />
                    </button>
                    <img src="/dragon.svg" alt="Logo" className="sv-dragon-logo" />
                </div>

                <div className="sv-content">
                    <h2 className="sv-title">Tu Racha Diaria</h2>

                    {/* Animación de fuego */}
                    <div className="sv-fire-animation"></div>

                    {/* Días de la semana */}
                    <div className="sv-days-container">
                        {["Lun", "Mar", "Mier", "Jue", "Vie", "Sáb", "Dom"].map((day, index) => (
                            <div
                                key={day}
                                className={`sv-day ${completedDays[index] ? "active" : ""}`}
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Mensaje de racha */}
                    <div className="sv-streak-info">
                        <h2 className="sv-streak-message">
                            ¡AJAS! LLEVAS {streak} DÍAS DE RACHA
                        </h2>
                        <span className="sv-streak-submessage">¡Bien hecho!</span>
                    </div>

                    {/* Botón de continuar */}
                    <button
                        className="sv-continue-button"
                        onClick={() => history.replace("/dashboard")}
                    >
                        Continuar
                    </button>
                </div>

                {/* Onda inferior */}
                <div className="sv-wave-container">
                    <img src="/wave-dashboard.svg" alt="Wave Animation" className="sv-wave-main-svg" />
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Streakview;