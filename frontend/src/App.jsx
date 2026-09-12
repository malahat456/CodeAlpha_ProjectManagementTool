import { useContext, useState, useEffect } from "react";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import MemberDashboard from "./pages/MemberDashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import KanbanBoard from "./pages/KanbanBoard";
import Sidebar from "./components/Sidebar";

import { AuthContext } from "./context/AuthContext";

function App() {
  const { auth } = useContext(AuthContext);

  const [currentPage, setCurrentPage] = useState(() => {
    const stored = localStorage.getItem("currentPage");
    return stored || "dashboard";
  });

  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    if (auth) {
      localStorage.setItem("currentPage", currentPage);
    }
  }, [currentPage, auth]);

  if (!auth) {
    return isSignup ? (
      <Signup setIsSignup={setIsSignup} />
    ) : (
      <Login setIsSignup={setIsSignup} />
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900">

      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        role={auth.role}
      />

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-y-auto">

        {currentPage === "dashboard" &&
          (auth.role === "admin" ? (
            <AdminDashboard />
          ) : (
            <MemberDashboard />
          ))}

        {currentPage === "projects" && <Projects />}

        {currentPage === "tasks" && <Tasks />}

        {currentPage === "kanban" && <KanbanBoard />}

      </main>

    </div>
  );
}

export default App;