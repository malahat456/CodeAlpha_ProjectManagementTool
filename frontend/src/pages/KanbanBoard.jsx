import { useEffect, useState, useContext } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import { api } from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function KanbanBoard() {
  const { auth } = useContext(AuthContext);

  const isAdmin = auth?.role === "admin";

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==============================
  // FETCH TASKS + USERS
  // ==============================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [tasksRes, usersRes] = await Promise.all([
          api.get("/tasks"),
          api.get("/users"),
        ]);

        setTasks(tasksRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error("Error loading Kanban board:", err);
        alert("Error loading Kanban Board");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ==============================
  // FIND USER NAME
  // ==============================
  const getUserName = (userId) => {
    const user = users.find(
      (u) => Number(u.id) === Number(userId)
    );

    return user ? user.name : "Unknown User";
  };

  // ==============================
  // CHECK OVERDUE
  // ==============================
  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === "completed") {
      return false;
    }

    const due = new Date(dueDate);
    const today = new Date();

    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return due < today;
  };

  // ==============================
  // DRAG & DROP
  // ==============================
  const onDragEnd = async (result) => {
    if (!result.destination) {
      return;
    }

    const { source, destination } = result;

    // Same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;

    // --------------------------------
    // IMPORTANT FIX:
    // Only look inside the source column
    // --------------------------------
    const sourceTasks = tasks.filter(
      (task) => task.status === source.droppableId
    );

    const movedTask = sourceTasks[source.index];

    if (!movedTask) {
      console.error("Task not found");
      return;
    }

    // --------------------------------
    // MEMBER PERMISSION CHECK
    // --------------------------------
    if (
      !isAdmin &&
      Number(movedTask.user_id) !== Number(auth.id)
    ) {
      alert("You can only move your own tasks.");
      return;
    }

    // --------------------------------
    // Save previous state
    // --------------------------------
    const previousTasks = [...tasks];

    // --------------------------------
    // Optimistic UI update
    // --------------------------------
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        Number(task.id) === Number(movedTask.id)
          ? {
              ...task,
              status: newStatus,
            }
          : task
      )
    );

    // --------------------------------
    // Update backend
    // --------------------------------
    try {
      await api.put(`/tasks/status/${movedTask.id}`, {
        status: newStatus,
      });
    } catch (err) {
      console.error("Error updating task status:", err);

      // Restore previous state
      setTasks(previousTasks);

      alert("Error updating task status");
    }
  };

  // ==============================
  // KANBAN COLUMNS
  // ==============================
  const columns = {
    pending: {
      title: "To Do",
      icon: "📌",
      color: "from-yellow-600 to-amber-600",
    },

    "in-progress": {
      title: "In Progress",
      icon: "⚡",
      color: "from-blue-600 to-cyan-600",
    },

    completed: {
      title: "Done",
      icon: "✅",
      color: "from-green-600 to-emerald-600",
    },
  };

  // ==============================
  // GET TASKS BY STATUS
  // ==============================
  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  // ==============================
  // LOADING
  // ==============================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white text-2xl">
          Loading board...
        </p>
      </div>
    );
  }

  // ==============================
  // UI
  // ==============================
  return (
    <div className="p-6 md:p-10 min-h-screen">

      {/* PAGE TITLE */}
      <div className="text-center mb-10">

        <h2 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-2xl">
          Kanban Board 🎯
        </h2>

        <p className="text-white/60 mt-3">
          Drag and drop tasks to update their status
        </p>

      </div>

      {/* DRAG & DROP */}
      <DragDropContext onDragEnd={onDragEnd}>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">

          {Object.entries(columns).map(
            ([status, column]) => {

              const columnTasks =
                getTasksByStatus(status);

              return (
                <div
                  key={status}
                  className="backdrop-blur-xl bg-white/10 rounded-3xl p-5 md:p-6 border border-white/20 shadow-2xl"
                >

                  {/* COLUMN HEADER */}
                  <div className="mb-6">

                    <div
                      className={`bg-gradient-to-r ${column.color} rounded-2xl px-4 py-4`}
                    >

                      <h3 className="text-xl md:text-2xl font-bold text-white text-center">
                        {column.icon} {column.title}
                      </h3>

                      <p className="text-white/80 text-sm text-center mt-1">
                        {columnTasks.length}{" "}
                        {columnTasks.length === 1
                          ? "task"
                          : "tasks"}
                      </p>

                    </div>

                  </div>

                  {/* DROPPABLE COLUMN */}
                  <Droppable droppableId={status}>

                    {(provided, snapshot) => (

                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`
                          min-h-[400px]
                          rounded-2xl
                          p-2
                          transition-all
                          duration-200
                          ${
                            snapshot.isDraggingOver
                              ? "bg-white/20 ring-2 ring-white/30"
                              : "bg-black/5"
                          }
                        `}
                      >

                        {columnTasks.length === 0 && (
                          <div className="flex items-center justify-center min-h-[150px]">

                            <p className="text-white/40 text-center">
                              No tasks here
                            </p>

                          </div>
                        )}

                        {/* TASK CARDS */}
                        {columnTasks.map(
                          (task, index) => {

                            const overdue =
                              isOverdue(
                                task.due_date,
                                task.status
                              );

                            const canDrag =
                              isAdmin ||
                              Number(task.user_id) ===
                                Number(auth.id);

                            return (
                              <Draggable
                                key={String(task.id)}
                                draggableId={String(task.id)}
                                index={index}
                                isDragDisabled={!canDrag}
                              >

                                {(
                                  provided,
                                  snapshot
                                ) => (

                                  <div
                                    ref={
                                      provided.innerRef
                                    }
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`
                                      bg-white/20
                                      backdrop-blur-md
                                      rounded-2xl
                                      p-5
                                      mb-4
                                      border
                                      border-white/20
                                      shadow-lg
                                      transition-all
                                      duration-200

                                      ${
                                        snapshot.isDragging
                                          ? "scale-105 shadow-2xl rotate-2 bg-white/30"
                                          : "hover:bg-white/25 hover:shadow-xl"
                                      }

                                      ${
                                        !canDrag
                                          ? "cursor-not-allowed opacity-80"
                                          : "cursor-grab"
                                      }
                                    `}
                                  >

                                    {/* TASK TITLE */}
                                    <h4 className="text-lg md:text-xl font-bold text-white mb-4">
                                      {task.title}
                                    </h4>

                                    {/* DUE DATE */}
                                    {task.due_date && (
                                      <div className="mb-3">

                                        <p
                                          className={`text-sm ${
                                            overdue
                                              ? "text-red-300 font-bold"
                                              : "text-white/80"
                                          }`}
                                        >
                                          {overdue
                                            ? "⚠️ Overdue: "
                                            : "📅 Due: "}

                                          {new Date(
                                            task.due_date
                                          ).toLocaleDateString()}
                                        </p>

                                      </div>
                                    )}

                                    {/* PRIORITY */}
                                    <div className="mb-3">

                                      <span
                                        className={`
                                          inline-block
                                          px-3
                                          py-1
                                          rounded-full
                                          text-xs
                                          font-bold
                                          uppercase

                                          ${
                                            task.priority ===
                                            "high"
                                              ? "bg-red-500/30 text-red-300 border border-red-400/30"
                                              : task.priority ===
                                                "low"
                                              ? "bg-green-500/30 text-green-300 border border-green-400/30"
                                              : "bg-yellow-500/30 text-yellow-300 border border-yellow-400/30"
                                          }
                                        `}
                                      >
                                        {task.priority ||
                                          "medium"}
                                      </span>

                                    </div>

                                    {/* ASSIGNED USER */}
                                    <div className="flex items-center gap-2 mt-4">

                                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                        👤
                                      </div>

                                      <div>
                                        <p className="text-white/50 text-xs">
                                          Assigned to
                                        </p>

                                        <p className="text-white text-sm font-medium">
                                          {getUserName(
                                            task.user_id
                                          )}
                                        </p>
                                      </div>

                                    </div>

                                    {/* OVERDUE BADGE */}
                                    {overdue && (
                                      <div className="mt-4">

                                        <span className="inline-block px-3 py-1 rounded-lg bg-red-500/20 border border-red-400/30 text-red-300 text-xs font-bold">
                                          ⚠️ OVERDUE
                                        </span>

                                      </div>
                                    )}

                                    {/* MEMBER DRAG INFO */}
                                    {!isAdmin &&
                                      Number(
                                        task.user_id
                                      ) ===
                                        Number(auth.id) && (
                                        <p className="text-white/40 text-xs mt-4">
                                          ↕ Drag to update status
                                        </p>
                                      )}

                                    {/* NON-OWNER MEMBER INFO */}
                                    {!isAdmin &&
                                      Number(
                                        task.user_id
                                      ) !==
                                        Number(auth.id) && (
                                        <p className="text-white/30 text-xs mt-4">
                                          🔒 Assigned to another
                                          member
                                        </p>
                                      )}

                                  </div>

                                )}

                              </Draggable>
                            );
                          }
                        )}

                        {provided.placeholder}

                      </div>

                    )}

                  </Droppable>

                </div>
              );
            }
          )}

        </div>

      </DragDropContext>

    </div>
  );
}