// ================= Firebase Initialization =================
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, setDoc, getDoc, doc, query, where, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAl-8ltnzgt_oKER5UAD1bh4sgDKPm0w_A",
  authDomain: "website-754f4.firebaseapp.com",
  projectId: "website-754f4",
  storageBucket: "website-754f4.firebasestorage.app",
  messagingSenderId: "1056835843829",
  appId: "1:1056835843829:web:9f84b539d7a19b094ff7bc",
  measurementId: "G-6NK4XLM5P0"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ================= User Authentication =================
export async function registerUser(email, password, role){
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), { email, role });
        localStorage.setItem("uid", user.uid);
        localStorage.setItem("role", role);
        alert("User registered successfully!");
        return user.uid;
    } catch (err){
        alert(err.message);
    }
}

export async function loginUser(email, password){
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if(!userDoc.exists()){
            alert("User role not found!");
            return null;
        }
        const role = userDoc.data().role;
        localStorage.setItem("uid", user.uid);
        localStorage.setItem("role", role);
        return user.uid;
    } catch(err){
        alert(err.message);
        return null;
    }
}

// ================= Product Management =================
export async function uploadProduct(name, price, file, sellerId){
    try{
        const storageRef = ref(storage, `products/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        await addDoc(collection(db, "products"), { name, price, fileURL: downloadURL, sellerId });
        alert("Product uploaded successfully!");
    } catch(err){
        alert(err.message);
    }
}

export async function getAllProducts(){
    const snapshot = await getDocs(collection(db, "products"));
    let products = [];
    snapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
    return products;
}

export async function getSellerProducts(uid){
    const q = query(collection(db, "products"), where("sellerId","==",uid));
    const snapshot = await getDocs(q);
    let products = [];
    snapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
    return products;
}

// ================= Dashboard =================
export async function loadDashboard(uid, role){
    const container = document.getElementById("products-container");
    if(!container) return; // Agar dashboard HTML me container nahi hai

    container.innerHTML = "";
    if(role === "buyer"){
        const products = await getAllProducts();
        products.forEach(prod=>{
            container.innerHTML += `<div>
                <h3>${prod.name}</h3>
                <p>Price: ${prod.price}</p>
                <a href="${prod.fileURL}" download>Download</a>
            </div>`;
        });
    } else if(role === "seller"){
        const products = await getSellerProducts(uid);
        products.forEach(prod=>{
            container.innerHTML += `<div>
                <h3>${prod.name}</h3>
                <p>Price: ${prod.price}</p>
                <a href="${prod.fileURL}" download>Download</a>
            </div>`;
        });
    } else if(role === "admin"){
        window.location.href = "admin.html";
    }
}

// ================= Admin Panel =================
export async function getAllUsers(){
    const snapshot = await getDocs(collection(db,"users"));
    let users = [];
    snapshot.forEach(u=>users.push({id:u.id,...u.data()}));
    return users;
}

export async function deleteUser(uid){
    await deleteDoc(doc(db,"users",uid));
    alert("User deleted successfully!");
}

export async function getAllProductsAdmin(){
    const snapshot = await getDocs(collection(db,"products"));
    let products = [];
    snapshot.forEach(p=>products.push({id:p.id,...p.data()}));
    return products;
}