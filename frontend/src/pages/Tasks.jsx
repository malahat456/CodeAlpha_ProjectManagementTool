import { useEffect, useState, useContext } from "react";
import { api } from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function Tasks() {
  const { auth } = useContext(AuthContext);

  const isAdmin = auth?.role === "admin";

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [newTask, setNewTask] = useState({
    title: "",
    project_id: "",
    user_id: "",
    due_date: "",
    priority: "medium",
    status: "pending",
  });

  const [commentInputs, setCommentInputs] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  // =========================================================
  // FETCH TASKS WITH COMMENTS AND ATTACHMENTS
  // =========================================================

  useEffect(() => {
    const fetchTasksWithData = async () => {
      setLoading(true);

      try {
        const tasksRes = await api.get("/tasks");

        const tasksData = Array.isArray(tasksRes.data)
          ? tasksRes.data
          : [];

        const tasksWithData = await Promise.all(
          tasksData.map(async (task) => {
            let comments = [];
            let attachments = [];

            // -------------------------------------------------
            // COMMENTS
            // -------------------------------------------------

            try {
              const commentsRes = await api.get("/comments", {
                params: {
                  task_id: task.id,
                },
              });

              comments = Array.isArray(commentsRes.data)
                ? commentsRes.data
                : [];
            } catch (err) {
              console.error(
                `Error loading comments for task ${task.id}:`,
                err
              );
            }

            // -------------------------------------------------
            // ATTACHMENTS
            // -------------------------------------------------

            try {
              const attachmentsRes = await api.get("/files", {
                params: {
                  task_id: task.id,
                },
              });

              attachments = Array.isArray(attachmentsRes.data)
                ? attachmentsRes.data
                : [];
            } catch (err) {
              console.error(
                `Error loading attachments for task ${task.id}:`,
                err
              );
            }

            // -------------------------------------------------
            // RETURN SAFE TASK OBJECT
            // -------------------------------------------------

            return {
              ...task,

              id: Number(task.id),

              title: task.title || "Untitled Task",

              project_id: task.project_id
                ? Number(task.project_id)
                : null,

              user_id: task.user_id
                ? Number(task.user_id)
                : null,

              status: task.status || "pending",

              priority: task.priority || "medium",

              due_date: task.due_date || null,

              comments,

              attachments,
            };
          })
        );

        setTasks(tasksWithData);
      } catch (err) {
        console.error("Error fetching tasks:", err);

        alert(
          err.response?.data?.message ||
            "Failed to load tasks"
        );
      } finally {
        setLoading(false);
      }
    };

    if (auth) {
      fetchTasksWithData();
    }
  }, [auth]);

  // =========================================================
  // FETCH PROJECTS AND USERS
  // =========================================================

  useEffect(() => {
    const fetchProjectsAndUsers = async () => {
      if (!auth) return;

      try {
        const projectsRes = await api.get("/projects");

        setProjects(
          Array.isArray(projectsRes.data)
            ? projectsRes.data
            : []
        );

        const usersRes = await api.get("/users");

        setUsers(
          Array.isArray(usersRes.data)
            ? usersRes.data
            : []
        );
      } catch (err) {
        console.error(
          "Error loading projects and users:",
          err
        );
      }
    };

    fetchProjectsAndUsers();
  }, [auth]);

  // =========================================================
  // HANDLE FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setNewTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // CREATE TASK
  // =========================================================

  const createTask = async () => {
    if (!newTask.title.trim()) {
      return alert("❌ Task title is required");
    }

    if (!newTask.project_id) {
      return alert("❌ Project ID is required");
    }

    if (!newTask.user_id) {
      return alert("❌ User ID is required");
    }

    try {
      const res = await api.post("/tasks", newTask);

      console.log("Create task response:", res.data);

      // -------------------------------------------------------
      // FIND PROJECT
      // -------------------------------------------------------

      const selectedProject = projects.find(
        (project) =>
          Number(project.id) ===
          Number(newTask.project_id)
      );

      // -------------------------------------------------------
      // FIND USER
      // -------------------------------------------------------

      const selectedUser = users.find(
        (user) =>
          Number(user.id) ===
          Number(newTask.user_id)
      );

      // -------------------------------------------------------
      // CREATE COMPLETE FRONTEND TASK OBJECT
      // -------------------------------------------------------

      const createdTask = {
        id: Number(res.data.taskId),

        title: newTask.title,

        project_id: Number(newTask.project_id),

        user_id: Number(newTask.user_id),

        due_date: newTask.due_date || null,

        priority: newTask.priority || "medium",

        status: newTask.status || "pending",

        project_title:
          selectedProject?.title ||
          "Unknown Project",

        user_name:
          selectedUser?.name ||
          "Unknown User",

        comments: [],

        attachments: [],
      };

      console.log(
        "Created frontend task:",
        createdTask
      );

      // -------------------------------------------------------
      // ADD TASK
      // -------------------------------------------------------

      setTasks((prevTasks) => [
        createdTask,
        ...prevTasks,
      ]);

      // -------------------------------------------------------
      // RESET FORM
      // -------------------------------------------------------

      setNewTask({
        title: "",
        project_id: "",
        user_id: "",
        due_date: "",
        priority: "medium",
        status: "pending",
      });

      alert("✅ Task created successfully");
    } catch (err) {
      console.error("Error creating task:", err);

      alert(
        err.response?.data?.message ||
          "Error creating task"
      );
    }
  };

  // =========================================================
  // UPDATE TASK
  // =========================================================

  const updateTask = async () => {
    if (!newTask.title.trim()) {
      return alert("❌ Task title is required");
    }

    if (!newTask.project_id) {
      return alert("❌ Project ID is required");
    }

    if (!newTask.user_id) {
      return alert("❌ User ID is required");
    }

    try {
      const res = await api.put(
        `/tasks/${editingId}`,
        newTask
      );

      console.log("Update task response:", res.data);

      const selectedProject = projects.find(
        (project) =>
          Number(project.id) ===
          Number(newTask.project_id)
      );

      const selectedUser = users.find(
        (user) =>
          Number(user.id) ===
          Number(newTask.user_id)
      );

      // -------------------------------------------------------
      // UPDATE ONLY THE EXISTING TASK
      // Keep comments and attachments.
      // -------------------------------------------------------

      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (
            Number(task.id) !==
            Number(editingId)
          ) {
            return task;
          }

          return {
            ...task,

            id: Number(editingId),

            title: newTask.title,

            project_id: Number(
              newTask.project_id
            ),

            user_id: Number(
              newTask.user_id
            ),

            due_date:
              newTask.due_date || null,

            priority:
              newTask.priority ||
              "medium",

            status:
              newTask.status ||
              "pending",

            project_title:
              selectedProject?.title ||
              task.project_title ||
              "Unknown Project",

            user_name:
              selectedUser?.name ||
              task.user_name ||
              "Unknown User",

            comments:
              task.comments || [],

            attachments:
              task.attachments || [],
          };
        })
      );

      setEditingId(null);

      setNewTask({
        title: "",
        project_id: "",
        user_id: "",
        due_date: "",
        priority: "medium",
        status: "pending",
      });

      alert("✅ Task updated successfully");
    } catch (err) {
      console.error("Error updating task:", err);

      alert(
        err.response?.data?.message ||
          "Error updating task"
      );
    }
  };

  // =========================================================
  // DELETE TASK
  // =========================================================

  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await api.delete(`/tasks/${id}`);

      setTasks((prevTasks) =>
        prevTasks.filter(
          (task) =>
            Number(task.id) !== Number(id)
        )
      );

      alert("🗑️ Task deleted successfully");
    } catch (err) {
      console.error("Error deleting task:", err);

      alert(
        err.response?.data?.message ||
          "Error deleting task"
      );
    }
  };

  // =========================================================
  // COMPLETE TASK
  // =========================================================

  const completeTask = async (id) => {
    try {
      await api.put(
        `/tasks/status/${id}`,
        {
          status: "completed",
        }
      );

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          Number(task.id) === Number(id)
            ? {
                ...task,
                status: "completed",
              }
            : task
        )
      );

      alert("✅ Task completed!");
    } catch (err) {
      console.error(
        "Error completing task:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Error completing task"
      );
    }
  };

  // =========================================================
  // ADD COMMENT
  // =========================================================

  const addComment = async (taskId) => {
    const message =
      commentInputs[taskId]?.trim();

    if (!message) {
      return;
    }

    const task = tasks.find(
      (t) =>
        Number(t.id) ===
        Number(taskId)
    );

    const project_id =
      task?.project_id || null;

    try {
      const res = await api.post(
        "/comments",
        {
          task_id: taskId,
          project_id,
          message,
        }
      );

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          Number(task.id) ===
          Number(taskId)
            ? {
                ...task,
                comments: [
                  ...(task.comments || []),
                  res.data,
                ],
              }
            : task
        )
      );

      setCommentInputs((prev) => ({
        ...prev,
        [taskId]: "",
      }));
    } catch (err) {
      console.error(
        "Error adding comment:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Error adding comment"
      );
    }
  };

  // =========================================================
  // START EDIT COMMENT
  // =========================================================

  const startEditComment = (comment) => {
    setEditingCommentId(comment.id);

    setEditingCommentText(
      comment.message || ""
    );
  };

  // =========================================================
  // UPDATE COMMENT
  // =========================================================

  const updateComment = async (
    commentId,
    taskId
  ) => {
    if (!editingCommentText.trim()) {
      return alert(
        "Comment cannot be empty"
      );
    }

    try {
      const res = await api.put(
        `/comments/${commentId}`,
        {
          message:
            editingCommentText.trim(),
        }
      );

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          Number(task.id) ===
          Number(taskId)
            ? {
                ...task,

                comments: (
                  task.comments || []
                ).map((comment) =>
                  Number(comment.id) ===
                  Number(commentId)
                    ? {
                        ...comment,
                        ...res.data,
                        message:
                          res.data?.message ||
                          editingCommentText.trim(),
                      }
                    : comment
                ),
              }
            : task
        )
      );

      setEditingCommentId(null);
      setEditingCommentText("");

      alert("Comment updated!");
    } catch (err) {
      console.error(
        "Error updating comment:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Error updating comment"
      );
    }
  };

  // =========================================================
  // DELETE COMMENT
  // =========================================================

  const deleteComment = async (
    commentId,
    taskId
  ) => {
    if (!window.confirm("Delete this comment?")) {
      return;
    }

    try {
      await api.delete(
        `/comments/${commentId}`
      );

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          Number(task.id) ===
          Number(taskId)
            ? {
                ...task,

                comments: (
                  task.comments || []
                ).filter(
                  (comment) =>
                    Number(comment.id) !==
                    Number(commentId)
                ),
              }
            : task
        )
      );

      alert("Comment deleted");
    } catch (err) {
      console.error(
        "Error deleting comment:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Error deleting comment"
      );
    }
  };

  // =========================================================
  // UPLOAD FILE
  // =========================================================

  const uploadFile = async (
    file,
    taskId
  ) => {
    if (!file) {
      return;
    }

    const formData = new FormData();

    formData.append("file", file);

    formData.append(
      "task_id",
      taskId
    );

    try {
      const res = await api.post(
        "/files/upload",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          Number(task.id) ===
          Number(taskId)
            ? {
                ...task,

                attachments: [
                  ...(task.attachments || []),
                  res.data,
                ],
              }
            : task
        )
      );

      alert(
        "File uploaded successfully! 📎"
      );
    } catch (err) {
      console.error(
        "Error uploading file:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Error uploading file"
      );
    }
  };

  // =========================================================
  // DELETE ATTACHMENT
  // =========================================================

  const deleteAttachment = async (
    fileId,
    taskId
  ) => {
    if (!window.confirm("Delete this file?")) {
      return;
    }

    try {
      await api.delete(
        `/files/${fileId}`
      );

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          Number(task.id) ===
          Number(taskId)
            ? {
                ...task,

                attachments: (
                  task.attachments || []
                ).filter(
                  (file) =>
                    Number(file.id) !==
                    Number(fileId)
                ),
              }
            : task
        )
      );

      alert("File deleted");
    } catch (err) {
      console.error(
        "Error deleting file:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Error deleting file"
      );
    }
  };

  // =========================================================
  // START EDIT TASK
  // =========================================================

  const startEdit = (task) => {
    setEditingId(task.id);

    setNewTask({
      title: task.title || "",

      project_id:
        task.project_id || "",

      user_id:
        task.user_id || "",

      due_date:
        task.due_date || "",

      priority:
        task.priority || "medium",

      status:
        task.status || "pending",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // CANCEL EDIT
  // =========================================================

  const cancelEdit = () => {
    setEditingId(null);

    setNewTask({
      title: "",
      project_id: "",
      user_id: "",
      due_date: "",
      priority: "medium",
      status: "pending",
    });
  };

  // =========================================================
  // STATUS BADGE
  // =========================================================

  const getStatusBadge = (status) => {
    const safeStatus =
      status || "pending";

    const styles = {
      pending:
        "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",

      "in-progress":
        "bg-blue-500/20 text-blue-300 border-blue-500/50",

      completed:
        "bg-green-500/20 text-green-300 border-green-500/50",
    };

    return `px-4 py-2 rounded-full border text-sm font-medium ${
      styles[safeStatus] ||
      styles.pending
    }`;
  };

  // =========================================================
  // PRIORITY BADGE
  // =========================================================

  const getPriorityBadge = (
    priority
  ) => {
    const safePriority =
      priority || "medium";

    const styles = {
      low:
        "bg-green-500/20 text-green-300 border-green-500/50",

      medium:
        "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",

      high:
        "bg-red-500/20 text-red-300 border-red-500/50",
    };

    return `px-4 py-2 rounded-full border text-sm font-medium ${
      styles[safePriority] ||
      styles.medium
    }`;
  };

  // =========================================================
  // CHECK OVERDUE
  // =========================================================

  const isOverdue = (
    dueDate,
    status
  ) => {
    if (
      !dueDate ||
      status === "completed"
    ) {
      return false;
    }

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const due = new Date(
      dueDate
    );

    due.setHours(
      0,
      0,
      0,
      0
    );

    return due < today;
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="p-10">
      {/* =====================================================
          PAGE TITLE
      ===================================================== */}

      <h2 className="text-5xl font-extrabold text-white mb-12 text-center drop-shadow-2xl">
        Tasks 📋
      </h2>

      {/* =====================================================
          ADMIN CREATE / EDIT FORM
      ===================================================== */}

      {isAdmin && (
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl mb-12 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-6">
            {editingId
              ? "Edit Task"
              : "Create New Task"}
          </h3>

          {/* TITLE */}

          <input
            name="title"
            placeholder="Task Title"
            value={newTask.title}
            onChange={handleChange}
            className="w-full px-6 py-4 rounded-xl bg-white/80 backdrop-blur-md border border-white/30 text-black font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition mb-4"
          />

          {/* PROJECT */}

          <select
            name="project_id"
            value={newTask.project_id}
            onChange={handleChange}
            className="w-full px-6 py-4 rounded-xl bg-white/80 backdrop-blur-md border border-white/30 text-black font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition mb-4 cursor-pointer"
          >
            <option value="">
              Select Project
            </option>

            {projects.map(
              (project) => (
                <option
                  key={project.id}
                  value={project.id}
                >
                  {project.title}
                </option>
              )
            )}
          </select>

          {/* ASSIGN USER */}

          <select
            name="user_id"
            value={newTask.user_id}
            onChange={handleChange}
            className="w-full px-6 py-4 rounded-xl bg-white/80 backdrop-blur-md border border-white/30 text-black font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition mb-4 cursor-pointer"
          >
            <option value="">
              Assign To
            </option>

            {users.map(
              (user) => (
                <option
                  key={user.id}
                  value={user.id}
                >
                  {user.name} (
                  {user.role})
                </option>
              )
            )}
          </select>

          {/* DUE DATE */}

          <input
            name="due_date"
            type="date"
            value={newTask.due_date}
            onChange={handleChange}
            className="w-full px-6 py-4 rounded-xl bg-white/80 backdrop-blur-md border border-white/30 text-black font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition mb-4"
          />

          {/* PRIORITY */}

          <select
            name="priority"
            value={newTask.priority}
            onChange={handleChange}
            className="w-full px-6 py-4 rounded-xl bg-white/80 backdrop-blur-md border border-white/30 text-black font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition mb-6 cursor-pointer"
          >
            <option value="low">
              Low Priority
            </option>

            <option value="medium">
              Medium Priority
            </option>

            <option value="high">
              High Priority
            </option>
          </select>

          {/* BUTTONS */}

          <div className="flex gap-4">
            <button
              onClick={
                editingId
                  ? updateTask
                  : createTask
              }
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition transform hover:-translate-y-1"
            >
              {editingId
                ? "Update Task ✏️"
                : "Create Task 🚀"}
            </button>

            {editingId && (
              <button
                onClick={cancelEdit}
                className="px-8 py-4 bg-gray-600 text-white font-bold rounded-xl hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          TASK LIST
      ===================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {loading ? (
          <p className="text-white text-center col-span-full text-2xl mt-20">
            Loading tasks...
          </p>
        ) : tasks.length === 0 ? (
          <p className="text-white/70 text-center col-span-full text-2xl mt-20">
            No tasks assigned yet 🚀
          </p>
        ) : (
          tasks.map((task) => {
            const safeStatus =
              task.status ||
              "pending";

            const safePriority =
              task.priority ||
              "medium";

            return (
              <div
                key={task.id}
                className={`backdrop-blur-xl bg-white/10 rounded-3xl p-8 border shadow-2xl transform transition hover:scale-105 hover:shadow-purple-500/50 flex flex-col ${
                  isOverdue(
                    task.due_date,
                    safeStatus
                  )
                    ? "border-red-500/50 shadow-red-500/30"
                    : "border-white/20"
                }`}
              >
                <div className="flex-1">
                  {/* =================================================
                      TITLE
                  ================================================= */}

                  <h3 className="text-3xl font-extrabold text-white mb-4 break-words">
                    {task.title ||
                      "Untitled Task"}
                  </h3>

                  {/* =================================================
                      STATUS & PRIORITY
                  ================================================= */}

                  <div className="flex gap-3 mb-6 flex-wrap">
                    <span
                      className={getStatusBadge(
                        safeStatus
                      )}
                    >
                      {safeStatus.toUpperCase()}
                    </span>

                    <span
                      className={getPriorityBadge(
                        safePriority
                      )}
                    >
                      {safePriority.toUpperCase()}{" "}
                      PRIORITY
                    </span>
                  </div>

                  {/* =================================================
                      DUE DATE
                  ================================================= */}

                  {task.due_date && (
                    <p
                      className={`mb-6 text-lg font-medium ${
                        isOverdue(
                          task.due_date,
                          safeStatus
                        )
                          ? "text-red-300"
                          : "text-white/80"
                      }`}
                    >
                      Due:{" "}
                      {new Date(
                        task.due_date
                      ).toLocaleDateString()}

                      {isOverdue(
                        task.due_date,
                        safeStatus
                      ) &&
                        " ⚠️ Overdue!"}
                    </p>
                  )}

                  {/* =================================================
                      PROJECT
                  ================================================= */}

                  <p className="text-white/80 mb-2">
                    Project:{" "}
                    {task.project_title ||
                      projects.find(
                        (project) =>
                          Number(
                            project.id
                          ) ===
                          Number(
                            task.project_id
                          )
                      )?.title ||
                      "Unknown Project"}
                  </p>

                  {/* =================================================
                      ASSIGNED USER
                  ================================================= */}

                  <p className="text-white/80 mb-6">
                    Assigned To:{" "}
                    {task.user_name ||
                      users.find(
                        (user) =>
                          Number(
                            user.id
                          ) ===
                          Number(
                            task.user_id
                          )
                      )?.name ||
                      "Unknown User"}
                  </p>

                  {/* =================================================
                      COMMENTS
                  ================================================= */}

                  <div className="mt-8 border-t border-white/20 pt-6 flex flex-col">
                    <h4 className="text-xl font-bold text-white mb-4">
                      Comments 💬
                    </h4>

                    <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                      {task.comments &&
                      task.comments.length >
                        0 ? (
                        task.comments.map(
                          (comment) => (
                            <div
                              key={
                                comment.id
                              }
                              className="bg-white/10 rounded-xl p-4 border border-white/10 relative"
                            >
                              {/* COMMENT HEADER */}

                              <div className="flex justify-between items-start mb-2 gap-3">
                                <p className="text-white font-semibold break-words">
                                  {comment.user_name ||
                                    "User"}
                                </p>

                                {/* OWNER OR ADMIN */}

                                {(Number(
                                  comment.user_id
                                ) ===
                                  Number(
                                    auth?.id
                                  ) ||
                                  isAdmin) && (
                                  <div className="flex gap-2 shrink-0">
                                    <button
                                      onClick={() =>
                                        startEditComment(
                                          comment
                                        )
                                      }
                                      className="text-blue-300 hover:text-blue-100 text-sm"
                                    >
                                      Edit
                                    </button>

                                    <button
                                      onClick={() =>
                                        deleteComment(
                                          comment.id,
                                          task.id
                                        )
                                      }
                                      className="text-red-300 hover:text-red-100 text-sm"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* EDIT COMMENT */}

                              {Number(
                                editingCommentId
                              ) ===
                              Number(
                                comment.id
                              ) ? (
                                <div>
                                  <textarea
                                    value={
                                      editingCommentText
                                    }
                                    onChange={(
                                      e
                                    ) =>
                                      setEditingCommentText(
                                        e
                                          .target
                                          .value
                                      )
                                    }
                                    rows="3"
                                    className="w-full px-3 py-2 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white mb-2 resize-none focus:outline-none"
                                  />

                                  <div className="flex gap-2">
                                    <button
                                      onClick={() =>
                                        updateComment(
                                          comment.id,
                                          task.id
                                        )
                                      }
                                      className="px-4 py-1 bg-green-600 rounded hover:bg-green-700 text-sm text-white"
                                    >
                                      Save
                                    </button>

                                    <button
                                      onClick={() => {
                                        setEditingCommentId(
                                          null
                                        );
                                        setEditingCommentText(
                                          ""
                                        );
                                      }}
                                      className="px-4 py-1 bg-gray-600 rounded hover:bg-gray-700 text-sm text-white"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-white/80 text-sm break-words">
                                    {comment.message ||
                                      ""}
                                  </p>

                                  {comment.created_at && (
                                    <p className="text-white/50 text-xs mt-2">
                                      {new Date(
                                        comment.created_at
                                      ).toLocaleString()}
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
                          )
                        )
                      ) : (
                        <p className="text-white/60 italic">
                          No comments yet. Start
                          the conversation!
                        </p>
                      )}
                    </div>

                    {/* ADD COMMENT */}

                    <div className="mt-auto">
                      <textarea
                        placeholder="Write your comment here..."
                        value={
                          commentInputs[
                            task.id
                          ] || ""
                        }
                        onChange={(e) =>
                          setCommentInputs(
                            (prev) => ({
                              ...prev,
                              [task.id]:
                                e.target
                                  .value,
                            })
                          )
                        }
                        onKeyDown={(e) => {
                          if (
                            e.key ===
                              "Enter" &&
                            !e.shiftKey
                          ) {
                            e.preventDefault();

                            addComment(
                              task.id
                            );
                          }
                        }}
                        rows="3"
                        className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition resize-none mb-4"
                      />

                      <div className="flex justify-end">
                        <button
                          onClick={() =>
                            addComment(
                              task.id
                            )
                          }
                          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-bold hover:shadow-lg transform hover:-translate-y-1 transition"
                        >
                          Send 🚀
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* =================================================
                      ATTACHMENTS
                  ================================================= */}

                  <div className="mt-8 border-t border-white/20 pt-6">
                    <h4 className="text-xl font-bold text-white mb-4">
                      Attachments 📎
                    </h4>

                    <div className="space-y-3 mb-6">
                      {task.attachments &&
                      task.attachments.length >
                        0 ? (
                        task.attachments.map(
                          (file) => (
                            <div
                              key={
                                file.id
                              }
                              className="bg-white/10 rounded-xl p-4 border border-white/10 flex justify-between items-center gap-3"
                            >
                              <div className="flex-1 min-w-0">
                                <a
                                  href={`http://localhost:5000/uploads/${file.filename}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-300 hover:text-blue-100 font-medium break-all"
                                >
                                  {file.original_name ||
                                    file.filename ||
                                    "Attachment"}
                                </a>

                                <p className="text-white/50 text-xs mt-1">
                                  Uploaded by{" "}
                                  {file.user_name ||
                                    "User"}

                                  {file.created_at &&
                                    ` • ${new Date(
                                      file.created_at
                                    ).toLocaleDateString()}`}
                                </p>
                              </div>

                              {/* DELETE FILE */}

                              {(Number(
                                file.user_id
                              ) ===
                                Number(
                                  auth?.id
                                ) ||
                                isAdmin) && (
                                <button
                                  onClick={() =>
                                    deleteAttachment(
                                      file.id,
                                      task.id
                                    )
                                  }
                                  className="ml-4 text-red-300 hover:text-red-100 shrink-0"
                                >
                                  Delete 🗑️
                                </button>
                              )}
                            </div>
                          )
                        )
                      ) : (
                        <p className="text-white/60 italic">
                          No attachments yet
                        </p>
                      )}
                    </div>

                    {/* UPLOAD FILE */}

                    <div className="mt-4">
                      <input
                        type="file"
                        onChange={(e) => {
                          const file =
                            e.target
                              .files?.[0];

                          if (file) {
                            uploadFile(
                              file,
                              task.id
                            );

                            e.target.value =
                              "";
                          }
                        }}
                        className="block w-full text-sm text-white/70
                        file:mr-4 file:py-3 file:px-6
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-gradient-to-r file:from-indigo-600 file:to-purple-600
                        file:text-white
                        hover:file:from-indigo-700 hover:file:to-purple-700
                        cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* =================================================
                    ACTION BUTTONS
                ================================================= */}

                <div className="mt-8 flex flex-col gap-3">
                  {/* COMPLETE TASK */}

                  {safeStatus !==
                    "completed" &&
                    Number(
                      task.user_id
                    ) ===
                      Number(
                        auth?.id
                      ) && (
                      <button
                        onClick={() =>
                          completeTask(
                            task.id
                          )
                        }
                        className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition"
                      >
                        Mark as Completed
                        ✅
                      </button>
                    )}

                  {/* ADMIN ACTIONS */}

                  {isAdmin && (
                    <>
                      <button
                        onClick={() =>
                          startEdit(task)
                        }
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg transition"
                      >
                        Edit ✏️
                      </button>

                      <button
                        onClick={() =>
                          deleteTask(
                            task.id
                          )
                        }
                        className="w-full py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition"
                      >
                        Delete 🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

