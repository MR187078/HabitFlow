import React, { useState, useEffect } from "react";
import { IonPage, IonContent } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import "./AddHabit.css";

const habitIcons = [
    "dumbbell.svg",
    "early-awakening.svg",
    "early-sleep.svg",
    "fluent_food-16-filled.svg",
    "read-book.svg",
    "study.svg"
];

interface Habit {
    id: string;
    title: string;
    icon: string;
    completed: boolean;
}

const AddHabit: React.FC = () => {
    const [habitTitle, setHabitTitle] = useState("");
    const [selectedIcon, setSelectedIcon] = useState<string>(habitIcons[0]);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const history = useHistory();
    const user = auth.currentUser;

    useEffect(() => {
        if (!user) return;

        const fetchHabits = async () => {
            const userHabitsRef = collection(db, "users", user.uid, "habits");
            const querySnapshot = await getDocs(userHabitsRef);
            const loadedHabits = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Habit[];

            setHabits(loadedHabits);
        };

        fetchHabits();
    }, [user]);

    const applyHabit = async () => {
        if (!habitTitle.trim() || !selectedIcon || !user) return;
    
        try {
            const userHabitsRef = collection(db, "users", user.uid, "habits");
    
            if (editingHabitId) {
                await updateDoc(doc(userHabitsRef, editingHabitId), {
                    title: habitTitle,
                    icon: selectedIcon
                });
    
                setHabits(habits.map(habit =>
                    habit.id === editingHabitId ? { ...habit, title: habitTitle, icon: selectedIcon } : habit
                ));
            } else {
                const docRef = await addDoc(userHabitsRef, {
                    title: habitTitle,
                    icon: selectedIcon,
                    completed: false
                });
    
                setHabits([...habits, { id: docRef.id, title: habitTitle, icon: selectedIcon, completed: false }]);
            }
    
            setHabitTitle("");
            setSelectedIcon(habitIcons[0]);
            setEditingHabitId(null);
            setIsModalOpen(false);
    
        } catch (error) {
            console.error("Error al guardar hábito:", error);
        }
    };    
        

    const deleteHabit = async (id: string) => {
        try {
            if (!user) return;
            const habitDocRef = doc(db, "users", user.uid, "habits", id);

            await deleteDoc(habitDocRef);
            setHabits(habits.filter(habit => habit.id !== id));
            console.log(`Hábito con ID ${id} eliminado`);
        } catch (error) {
            console.error("Error al eliminar hábito:", error);
        }
    };

    const editHabit = (habit: Habit) => {
        setHabitTitle(habit.title);
        setSelectedIcon(habit.icon);
        setEditingHabitId(habit.id);
        setIsModalOpen(true);
    };

    const goToDashboard = () => {
        history.replace("/dashboard");
    };

    const logoutUser = async () => {
        try {
            await signOut(auth);
            console.log("Sesión cerrada correctamente");
            history.replace("/home");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
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
            
            <IonContent className="add-habit-container" fullscreen>
                <div className="navbar">
                    <button className="menu-toggle" onClick={() => setMenuOpen(true)}>
                        <img src="/menu-black.svg" alt="Menú" />
                    </button>

                    <img src="/dragon.svg" alt="Logo" className="dragon-logo" />
                </div>

                <h2 className="title-añadir">Añadir Hábito</h2>

                <div className="habit-list-container">
                    {habits.length === 0 ? (
                        <p className="info-text-añadir">No tienes hábitos agregados aún.</p>
                    ) : (
                        habits.map((habit) => (
                            <div key={habit.id} className="habit-item">
                                <img src={`/habits/${habit.icon}`} alt={habit.title} className="habit-item-icon" />
                                <span className="habit-title">{habit.title}</span>
                                <div className="habit-actions">
                                    <img src="/edit.svg" alt="Edit" className="action-icon" onClick={() => editHabit(habit)} />
                                    <img src="/erase.svg" alt="Delete" className="action-icon" onClick={() => deleteHabit(habit.id)} />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <button className="add-button" onClick={() => { setIsModalOpen(true); setEditingHabitId(null); }}>
                    Añadir Hábito
                </button>

                {isModalOpen && (
                    <div className="modal-overlay-habit">
                        <div className="modal-content-habit">
                            <button className="close-modal-habit" onClick={() => setIsModalOpen(false)}>✖</button>
                            <h3 className="subtitle">{editingHabitId ? "Editar Hábito" : "Añadir Hábito"}</h3>
                            <input
                                type="text"
                                className="habit-input"
                                placeholder="Escribe tu hábito..."
                                value={habitTitle}
                                onChange={(e) => setHabitTitle(e.target.value)}
                            />
                            <div className="icon-scroll-container">
                                <div className="icon-grid">
                                    {habitIcons.map((icon, index) => (
                                        <div
                                            key={index}
                                            className={`habit-icon ${selectedIcon === icon ? "selected" : ""}`}
                                            onClick={() => setSelectedIcon(icon)}
                                        >
                                            <img src={`/habits/${icon}`} alt={icon.replace(".svg", "")} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button className="apply-button" onClick={applyHabit}>
                                {editingHabitId ? "Actualizar" : "Aplicar"}
                            </button>
                        </div>
                    </div>
                )}

                <button className="finalize-button" onClick={goToDashboard}>
                    Finalizar
                </button>
                <div className="wave-container">
                    <img src="/wave-main.svg" alt="Wave Animation" className="wave-main-svg" />
                </div>
            </IonContent>
        </IonPage>
    );
};

export default AddHabit;