import React, { useCallback, useEffect, useState } from "react";
import { IonPage, IonContent } from "@ionic/react";
import { useHistory, useParams } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import Spinner from "../pages/Spinner"; // Importar el componente Spinner
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
    const [loading, setLoading] = useState(true); // Estado para controlar el spinner
    const [actionLoading, setActionLoading] = useState(false); // Estado para acciones específicas

    const fetchHabit = useCallback(async (uid: string) => {
        if (!id) return;
        try {
            setLoading(true); // Mostrar spinner al iniciar la carga
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
        } finally {
            setLoading(false); // Ocultar spinner cuando termine la carga
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
            setActionLoading(true); // Mostrar spinner durante la acción
            console.log("Marcando hábito como completado y eliminándolo...");

            const habitRef = doc(db, "users", userId, "habits", id);
            const habitSnap = await getDoc(habitRef);

            if (habitSnap.exists()) {
                // Marcar el hábito como completado
                await updateDoc(habitRef, { completed: true });
                console.log("Hábito marcado como completado");

                // Eliminar el hábito
                await deleteDoc(habitRef);
                console.log("Hábito eliminado correctamente");

                // Redirigir a la vista de Dashboard con un estado para forzar la recarga
                history.replace("/Streakview");
            } else {
                console.error("Hábito no encontrado en la base de datos");
            }
        } catch (error) {
            console.error("Error al marcar o eliminar el hábito:", error);
        } finally {
            setActionLoading(false); // Ocultar spinner cuando termine la acción
        }
    };

    return (
        <IonPage>
            {(loading || actionLoading) && <Spinner />} {/* Mostrar spinner durante carga o acciones */}

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

                    <button 
                        className="start-button" 
                        onClick={() => setModalOpen(true)}
                        disabled={loading} // Deshabilitar botón durante carga
                    >
                        Comenzar
                    </button>
                    <a 
                        className="back-button" 
                        href="#" 
                        onClick={(e) => { 
                            e.preventDefault(); 
                            if (!loading) history.replace("/dashboard"); 
                        }}
                    >
                        Regresar
                    </a>
                </div>

                {modalOpen && (
                    <div className="modal-overlay-habitview">
                        <div className="modal-content-habitview">
                            <button 
                                className="close-modal-habitview" 
                                onClick={() => setModalOpen(false)}
                                disabled={actionLoading} // Deshabilitar durante acción
                            >
                                ✖
                            </button>
                            <h3 className="subtitle">Realizar Hábito</h3>
                            <button 
                                className="finish-button" 
                                onClick={markAsCompleted}
                                disabled={actionLoading} // Deshabilitar durante acción
                            >
                                {actionLoading ? 'PROCESANDO...' : 'TERMINAR HÁBITO'}
                            </button>
                            <button 
                                className="finish-button" 
                                onClick={() => history.replace(`/timer/${id}`)}
                                disabled={loading} // Deshabilitar durante carga
                            >
                                TEMPORIZADOR
                            </button>
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