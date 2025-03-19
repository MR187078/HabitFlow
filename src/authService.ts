import { auth, db } from "./firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
export { auth };

export const registerUser = async (email: string, password: string, firstName: string, lastName: string, lastCompleted?: string,
    streak?: number ) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            firstName,
            lastName,
            email,
            lastCompleted: lastCompleted || null,
            streak: streak || null,
            createdAt: new Date(),
        });

        return user;
    } catch (error) {
        console.error("Error al registrar:", error);
        throw error;
    }
};

export const loginUser = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        throw error;
    }
};