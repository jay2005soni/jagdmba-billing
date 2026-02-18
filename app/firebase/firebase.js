import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

// 🔥 Direct Firebase Config (as you asked)
const firebaseConfig = {
  apiKey: "AIzaSyAnyW2-0y1QP8ZwXZrNmYpWhpKH1myHB7Q",
  authDomain: "jk-billing-9eccb.firebaseapp.com",
  projectId: "jk-billing-9eccb",
  storageBucket: "jk-billing-9eccb.firebasestorage.app",
  messagingSenderId: "431530969169",
  appId: "1:431530969169:web:4dbef002c44ec762ed1070",
};

// 🔒 Re-init bug fix (Next.js ke liye zaroori)
const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApps()[0];

export const auth = getAuth(app);
export default app;
