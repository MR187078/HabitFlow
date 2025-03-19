import React, { useCallback, useEffect, useState } from "react";
import { IonPage, IonContent } from "@ionic/react";
import { useHistory, useParams } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "./HabitView.css";

interface Habit {
    id: string;
    title: string;
    icon: string;
    completed: boolean;
}

const HabitView: React.FC = () => {
    const history = useHistory();
    const { id } = useParams<{ id: string }>();
    const [menuOpen, setMenuOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [habit, setHabit] = useState<Habit | null>(null);

    const fetchHabit = useCallback(async (uid: string) => {
        if (!id) return;
        try {
            const habitRef = doc(db, "users", uid, "habits", id);
            const habitSnap = await getDoc(habitRef);
            if (habitSnap.exists()) {
                const habitData = habitSnap.data() as Omit<Habit, "id">;
                setHabit({ id, ...habitData });
            } else {
                console.error("Hábito no encontrado");
            }
        } catch (error) {
            console.error("Error al obtener el hábito:", error);
        }
    }, [id]);
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                window.location.replace("/Streakview");
            } else {
                setUserId(user.uid);
                fetchHabit(user.uid);
            }
        });
        return () => unsubscribe();
    }, [fetchHabit]);

    const logoutUser = async () => {
        try {
            await signOut(auth);
            setMenuOpen(false);
            setTimeout(() => {
                window.location.href = "/home";
            }, 500);
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    const markAsCompleted = async () => {
        if (!userId || !id || !habit) return;
        try {
            const habitRef = doc(db, "users", userId, "habits", id);
            await updateDoc(habitRef, { completed: true });
            setHabit(prevHabit => prevHabit ? { ...prevHabit, completed: true } : prevHabit);

            console.log("Hábito marcado como completado. Redirigiendo a StreakView..."); // Depuración

            history.replace("/Streakview");
        } catch (error) {
            console.error("Error al marcar el hábito como completado:", error);
        }
    };

    return (
        <IonPage>
            <div className={`sidebar ${menuOpen ? 'open' : ''}`}>
                <div className="sidebar-content">
                    <button className="close-menu" onClick={() => setMenuOpen(false)}>✖</button>
                    
                    <div className="user-section">
                        <h3>Menú</h3>
                    </div>

                    <div className="menu-sections">
                        <div className="menu-item">
                            <img src="/timer-icon.png" alt="Timer" className="menu-icon" />
                            <span>Temporizador</span>
                        </div>
                        <div className="menu-item">
                            <img src="/user-icon.png" alt="User" className="menu-icon" />
                            <span>Usuario</span>
                        </div>
                        <div className="menu-item">
                            <img src="/messages-icon.png" alt="Messages" className="menu-icon" />
                            <span>Mensajes</span>
                        </div>
                        <div className="menu-item">
                            <img src="/saved-icon.png" alt="Saved" className="menu-icon" />
                            <span>Guardado</span>
                        </div>
                        <div className="menu-item">
                            <img src="/settings-icon.png" alt="Settings" className="menu-icon" />
                            <span>Configuracion</span>
                        </div>
                    </div>

                    {/* Botón de cerrar sesión con ícono */}
                    <button className="logout-button" onClick={logoutUser}>
                        <img src="/logout-icon.png" alt="Cerrar Sesión" className="logout-icon" />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </div>    

            <IonContent className="dashboard-container" fullscreen>
                <div className="navbar">
                    <button className="menu-toggle" onClick={() => setMenuOpen(true)}>
                        <img src="/menu-white.svg" alt="Menú" />
                    </button>
                    <img src="/dragon.svg" alt="Logo" className="dragon-logo" />
                </div>

                <div className="content-wrapper">
                    <div className="egg-container">
                        <img src="/dragon-egg.png" alt="Huevo de dragón" className="dragon-egg" />
                        <p className="egg-text">Completa tu hábito y nacerá el dragón</p>
                        <span className="egg-animo">¡Ánimo! Tú puedes</span>
                    </div>

                    <button className="start-button" onClick={() => setModalOpen(true)}>Comenzar</button>
                    <a className="back-button" href="#" onClick={(e) => { e.preventDefault(); history.replace("/dashboard"); }}>Regresar</a>
                </div>

                {modalOpen && (
                    <div className="modal-overlay-habitview">
                        <div className="modal-content-habitview">
                            <button className="close-modal-habitview" onClick={() => setModalOpen(false)}>✖</button>
                            <h3 className="subtitle">Realizar Hábito</h3>
                            <button className="finish-button" onClick={markAsCompleted}>TERMINAR HÁBITO</button>
                            <button className="finish-button" onClick={() => history.replace(`/timer/${id}`)}>TEMPORIZADOR</button>
                        </div>
                    </div>
                )}

                <div className="wave-container">
                    <img src="/wave-habit.svg" alt="Wave Animation" className="wave-main-svg" />
                </div>
            </IonContent>
        </IonPage>
    );
};

export default HabitView;