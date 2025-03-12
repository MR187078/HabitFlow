import React, { useEffect, useState } from "react";
import { IonPage, IonContent } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
    const history = useHistory();
    const [userName, setUserName] = useState<string | null>(null);
    const [habits, setHabits] = useState<{ title: string; icon: string }[]>([]);
    const [progress, setProgress] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

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
        const fetchUserData = async () => {
            if (!userId) return;

            const userSnapshot = await getDocs(collection(db, "users"));
            const userData = userSnapshot.docs.find(doc => doc.id === userId);

            if (userData) {
                setUserName(userData.data().firstName);
            }
        };

        const fetchUserHabits = async () => {
            if (!userId) return;

            const userHabitsRef = collection(db, "users", userId, "habits");
            const querySnapshot = await getDocs(userHabitsRef);
            const userHabits = querySnapshot.docs.map((doc) => doc.data() as { title: string; icon: string });

            setHabits(userHabits);
        };

        fetchUserData();
        fetchUserHabits();
    }, [userId]);

    useEffect(() => {
        if (habits.length > 0) {
            const completed = 0;
            setProgress((completed / habits.length) * 100);
        }
    }, [habits]);

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
            {menuOpen && (
                <div className="menu-overlay">
                    <div className="menu-content">
                        <button className="close-menu" onClick={() => setMenuOpen(false)}>✖</button>
                        <h3>Menú</h3>
                        <button className="logout-button" onClick={logoutUser}>Cerrar Sesión</button>
                    </div>
                </div>
            )}

            <IonContent className="dashboard-container" fullscreen>
                <div className="navbar">
                    <button className="menu-toggle" onClick={() => setMenuOpen(true)}>
                        <img src="/menu-black.svg" alt="Menú" />
                    </button>

                    <img src="/dragon.svg" alt="Logo" className="dragon-logo" />
                </div>

                <div className="content-wrapper">
                    <h2 className="welcome-text">Hola, {userName ? userName : "Usuario"}!</h2>
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
                            <p className="info-text">{`0 de ${habits.length} completados`}</p>

                            <div className="habit-list-container-dashboard">
                                {habits.map((habit, index) => (
                                    <button className="habit-item-dashboard" key={index}>
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