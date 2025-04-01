import React, { useEffect, useState } from "react";
import { IonPage, IonContent } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import Spinner from "../pages/Spinner"; // Importar el componente Spinner
import "./Dashboard.css";

interface Habit {
    id: string;
    title: string;
    icon: string;
    completed: boolean;
}

const Dashboard: React.FC = () => {
    const history = useHistory();
    const [userName, setUserName] = useState<string>("Usuario");
    const [habits, setHabits] = useState<Habit[]>([]);
    const [progress, setProgress] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true); // Estado para controlar el spinner

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                console.log("No hay usuario autenticado, redirigiendo al login...");
                window.location.replace("/login");
            } else {
                setUserId(user.uid);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;

            try {
                setLoading(true); // Mostrar spinner al iniciar la carga
                
                // Obtener datos del usuario
                const userDocRef = doc(db, "users", userId);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    const fullName = `${userData.firstName} ${userData.lastName}`;
                    setUserName(fullName);
                } else {
                    console.log("No se encontró el documento del usuario.");
                }

                // Obtener hábitos del usuario
                const userHabitsRef = collection(db, "users", userId, "habits");
                const querySnapshot = await getDocs(userHabitsRef);
                const userHabits = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                })) as Habit[];

                setHabits(userHabits);

                // Calcular progreso
                const completedHabits = userHabits.filter(habit => habit.completed).length;
                const totalHabits = userHabits.length;
                const progress = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;
                setProgress(progress);
                
            } catch (error) {
                console.error("Error al cargar datos:", error);
            } finally {
                setLoading(false); // Ocultar spinner cuando termine la carga
            }
        };

        fetchData();
    }, [userId, history.location.state]);

    const logoutUser = async () => {
        try {
            await signOut(auth);
            console.log("Sesión cerrada correctamente");
            
            setMenuOpen(false);
            setTimeout(() => {
                window.location.href = "/home";
            }, 500);
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };
    
    return (
        <IonPage>
            {loading && <Spinner />} {/* Mostrar spinner mientras loading sea true */}

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
                        <img src="/menu-black.svg" alt="Menú" />
                    </button>

                    <img src="/dragon.svg" alt="Logo" className="dragon-logo" />
                </div>

                <div className="content-wrapper">
                    <h2 className="welcome-text">Hola, {userName}!</h2>
                    <div className="progress-container">
                        <svg className="progress-circle" width="140" height="140" viewBox="0 0 140 140">
                            <circle className="progress-outer" cx="70" cy="70" r="65" />
                            <circle
                                className="progress-fill"
                                cx="70"
                                cy="70"
                                r="55"
                                strokeDasharray="345"
                                strokeDashoffset={(1 - progress / 100) * 345}
                            />
                            <circle className="progress-inner" cx="70" cy="70" r="45" />
                            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="progress-text">
                                {progress.toFixed(0)}%
                            </text>
                        </svg>
                    </div>

                    {habits.length === 0 ? (
                        <p className="info-text">Aún no tienes hábitos programados. Agrega uno pulsando el botón inferior.</p>
                    ) : (
                        <>
                            <p className="info-text">{`${habits.filter(habit => habit.completed).length} de ${habits.length} completados`}</p>

                            <div className="habit-list-container-dashboard">
                                {habits.map((habit) => (
                                    <button 
                                        className="habit-item-dashboard" 
                                        key={habit.id} 
                                        onClick={() => history.replace(`/habitview/${habit.id}`)}
                                    >
                                        <img src={`/habits/${habit.icon}`} alt={habit.title} className="habit-icon-dashboard" />
                                        <span className="habit-title">{habit.title}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="wave-container">
                    <img src="/wave-dashboard.svg" alt="Wave Animation" className="wave-main-svg" />
                </div>

                <button className="floating-button-dashboard" onClick={() => history.replace("/addhabit")}>+</button>
            </IonContent>
        </IonPage>
    );
};

export default Dashboard;