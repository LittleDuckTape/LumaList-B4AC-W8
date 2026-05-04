"use client";

import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 🔐 separate toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [editId, setEditId] = useState("");
  const [editTitle, setEditTitle] = useState("");

  const [error, setError] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "todos"), where("uid", "==", user.uid));

    return onSnapshot(q, (snapshot) => {
      setTodos(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Todo, "id">),
        }))
      );
    });
  }, [user]);

  async function register() {
    setError("");

    if (!email || !password || !confirmPassword) {
      setError("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function login() {
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function googleLogin() {
    setError("");

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function addTodo() {
    if (!title.trim()) return;

    await addDoc(collection(db, "todos"), {
      title,
      completed: false,
      uid: user?.uid,
      createdAt: serverTimestamp(),
    });

    setTitle("");
  }

  async function toggleTodo(todo: Todo) {
    await updateDoc(doc(db, "todos", todo.id), {
      completed: !todo.completed,
    });
  }

  async function saveEdit(id: string) {
    if (!editTitle.trim()) return;

    await updateDoc(doc(db, "todos", id), {
      title: editTitle,
    });

    setEditId("");
    setEditTitle("");
  }

  async function deleteTodo(id: string) {
    await deleteDoc(doc(db, "todos", id));
  }

  // 🔐 LOGIN / REGISTER
  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl text-black">
          <h1 className="text-4xl font-black text-center mb-2">
            ✨ LumaList ✨
          </h1>

          <p className="text-center text-gray-600 mb-6">
            {mode === "login"
              ? "Turn chaos into clarity! Log in to continue."
              : "Create your account and start organizing your day!"}
          </p>

          {error && (
            <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
              {error}
            </p>
          )}

          <input
            className="w-full border p-3 rounded-xl mb-3"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* PASSWORD */}
          <div className="relative mb-3">
            <input
              className="w-full border p-3 pr-12 rounded-xl"
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPassword ? "👁️" : "🔒"}
            </button>
          </div>

          {/* CONFIRM PASSWORD */}
          {mode === "register" && (
            <>
              <div className="relative mb-2">
                <input
                  className={`w-full border p-3 pr-12 rounded-xl ${
                    confirmPassword && password !== confirmPassword
                      ? "border-red-400"
                      : ""
                  }`}
                  placeholder="Confirm password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showConfirmPassword ? "👁️" : "🔒"}
                </button>
              </div>

              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-600 text-sm mb-3">
                  Passwords do not match.
                </p>
              )}
            </>
          )}

          {mode === "login" ? (
            <>
              <button
                onClick={login}
                className="w-full bg-indigo-600 text-white p-3 rounded-xl"
              >
                Login
              </button>

              <div className="flex items-center my-5">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="px-3 text-gray-500 text-sm">OR</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              <button
                onClick={googleLogin}
                className="w-full flex items-center justify-center gap-3 border p-3 rounded-xl"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  className="w-5 h-5"
                />
                Continue with Google
              </button>

              <p className="text-center mt-5">
                No account yet?{" "}
                <button
                  onClick={() => setMode("register")}
                  className="text-indigo-600 font-bold"
                >
                  Register
                </button>
              </p>
            </>
          ) : (
            <>
              <button
                onClick={register}
                disabled={
                  !email ||
                  !password ||
                  !confirmPassword ||
                  password !== confirmPassword
                }
                className="w-full bg-black text-white p-3 rounded-xl disabled:bg-gray-400"
              >
                Register
              </button>

              <p className="text-center mt-5">
                Already have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-indigo-600 font-bold"
                >
                  Login
                </button>
              </p>
            </>
          )}
        </div>
      </main>
    );
  }

  // 🧾 DASHBOARD
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-6 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-black">My To-Do List</h1>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-12 h-12 rounded-full bg-white text-black font-bold"
            >
              {(user.email || "U")[0].toUpperCase()}
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-3 bg-white text-black p-3 rounded-xl">
                <p className="text-sm">{user.email}</p>
                <button
                  onClick={() => signOut(auth)}
                  className="w-full mt-2 bg-red-500 text-white p-2 rounded"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl text-black">
          <div className="flex gap-3 mb-4">
            <input
              className="flex-1 border p-3 rounded-xl"
              placeholder="Add todo..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button
              onClick={addTodo}
              className="bg-indigo-600 text-white px-5 rounded-xl"
            >
              Add
            </button>
          </div>

          {todos.map((todo) => (
            <div
              key={todo.id}
              className="border p-3 rounded-xl flex justify-between mb-2"
            >
              {editId === todo.id ? (
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 border p-2 rounded"
                />
              ) : (
                <span
                  onClick={() => toggleTodo(todo)}
                  className={
                    todo.completed ? "line-through text-gray-400" : ""
                  }
                >
                  {todo.title}
                </span>
              )}

              <div className="flex gap-2">
                {editId === todo.id ? (
                  <button
                    onClick={() => saveEdit(todo.id)}
                    className="bg-green-500 text-white px-3 rounded"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditId(todo.id);
                      setEditTitle(todo.title);
                    }}
                    className="bg-yellow-500 text-white px-3 rounded"
                  >
                    Edit
                  </button>
                )}

                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="bg-red-500 text-white px-3 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}