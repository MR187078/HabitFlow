import React, { useCallback, useEffect, useState } from "react";
import { IonPage, IonContent } from "@ionic/react";
import { useHistory, useParams } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth"; // No necesitamos signOut
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "./Timer.css";

interface Habit {
    id: string;
    title: string;
    icon: string;
    completed: boolean;
}

const Timer: React.FC = () => {
    const history = useHistory();
    const { id } = useParams<{ id: string }>();
    const [userId, setUserId] = useState<string | null>(null);
    const [habit, setHabit] = useState<Habit | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(5);

    // Estado para controlar si el menú está abierto o cerrado
    const [menuOpen, setMenuOpen] = useState(false);

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
                window.location.replace("/login");
            } else {
                setUserId(user.uid);
                fetchHabit(user.uid);
            }
        });
        return () => unsubscribe();
    }, [fetchHabit]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isRunning && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRunning) {
            setIsRunning(false);
            if (userId && id && habit) {
                const markAsCompleted = async () => {
                    try {
                        const habitRef = doc(db, "users", userId, "habits", id);
                        await updateDoc(habitRef, { completed: true });
                        history.replace("/dashboard");
                    } catch (error) {
                        console.error("Error al marcar el hábito como completado:", error);
                    }
                };
                markAsCompleted();
            }
        }
        return () => clearInterval(timer);
    }, [isRunning, timeLeft, userId, id, habit, history]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/^0+(?=\d)/, "");
        const numValue = value === "" ? 0 : Math.max(0, Math.min(59, Number(value)));
        setMinutes(numValue);
    };

    const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/^0+(?=\d)/, "");
        const numValue = value === "" ? 0 : Math.max(0, Number(value));
        setHours(numValue);
    };

    const toggleTimer = () => {
        if (timeLeft === 0) {
            setTimeLeft(hours * 3600 + minutes * 60);
        }
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(0);
    };

    return (
        <IonPage>
            {/* Menú lateral */}
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
                            <span>Configuración</span>
                        </div>
                    </div>

                    {/* Botón para redirigir al dashboard */}
                    <button className="logout-button" onClick={() => history.replace("/dashboard")}>
                        <img src="/dashboard-icon.png" alt="Dashboard" className="logout-icon" />
                        <span>Ir al Dashboard</span>
                    </button>
                </div>
            </div>    
            
            <IonContent className="timer-container" fullscreen>
                <div className="navbar">
                    <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                        <img src="/menu-black.svg" alt="Menú" />
                    </button>
                    <img src="/dragon.svg" alt="Logo" className="dragon-logo" />
                </div>
                <div className="content-wrapper-timer">
                    <div className="egg-container-timer">
                        <img src="/dragon-egg.png" alt="Huevo de dragón" className="dragon-egg-timer" />
                        <span className="egg-animo">¡El dragón está por nacer!</span>
                    </div>
                </div>
                <div className="timer-content">
                    <h1 className="timer-display">{formatTime(timeLeft)}</h1>
                    <div className="time-picker">
                        <input 
                            type="number" 
                            value={hours} 
                            onChange={handleHoursChange} 
                            disabled={isRunning} 
                            min="0"
                        />
                        <span>h</span>
                        <input 
                            type="number" 
                            value={minutes} 
                            onChange={handleMinutesChange} 
                            disabled={isRunning} 
                            min="0" 
                            max="59"
                        />
                        <span>min</span>
                    </div>
                    <div className="timer-controls">
                        <button className="timer-button" onClick={resetTimer}>
                            <img src="/restart.svg" alt="Reiniciar" />
                        </button>
                        <button className="timer-button" onClick={toggleTimer}>
                            <img src={isRunning ? "/pause.svg" : "/play.svg"} alt={isRunning ? "Pausar" : "Iniciar"} />
                        </button>
                    </div>
                </div>
                <div className="wave-container">
                    <img src="/wave-timer.svg" alt="Wave Animation" className="wave-main-svg" />
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Timer;