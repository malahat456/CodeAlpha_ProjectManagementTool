import { useEffect, useState, useContext } from "react";
import { api } from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function Projects() {
  const { auth } = useContext(AuthContext);
  const isAdmin = auth.role === "admin";

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // ================= MEMBER STATES =================
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [membersLoading, setMembersLoading] = useState(false);

  // ================= FETCH PROJECTS =================
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects");
        setProjects(res.data);
      } catch (error) {
        console.error(
          "Fetch projects error:",
          error.response?.data || error
        );

        alert(
          error.response?.data?.message ||
            "Failed to load projects"
        );
      }
    };

    fetchProjects();
  }, []);

  // ================= FETCH USERS =================
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        setUsers(res.data);
      } catch (error) {
        console.error(
          "Fetch users error:",
          error.response?.data || error
        );
      }
    };

    fetchUsers();
  }, []);

  // ================= INPUT CHANGE =================
  const handleChange = (e) => {
    setNewProject({
      ...newProject,
      [e.target.name]: e.target.value,
    });
  };

  // ================= CREATE PROJECT =================
  const createProject = async () => {
    if (!newProject.title.trim()) {
      return alert("Project title is required!");
    }

    setLoading(true);

    try {
      const res = await api.post("/projects", newProject);

      setProjects([...projects, res.data]);

      setNewProject({
        title: "",
        description: "",
      });

      alert("Project created successfully! 🎉");
    } catch (error) {
      console.error(
        "Create project error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          "Error creating project"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= UPDATE PROJECT =================
  const updateProject = async (id) => {
    if (!newProject.title.trim()) {
      return alert("Project title is required!");
    }

    setLoading(true);

    try {
      const res = await api.put(
        `/projects/${id}`,
        newProject
      );

      setProjects(
        projects.map((p) =>
          p.id === id ? res.data : p
        )
      );

      setEditingId(null);

      setNewProject({
        title: "",
        description: "",
      });

      alert("Project updated!");
    } catch (error) {
      console.error(
        "Update project error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          "Error updating project"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE PROJECT =================
  const deleteProject = async (id) => {
    if (
      !confirm(
        "Are you sure you want to delete this project?"
      )
    ) {
      return;
    }

    try {
      await api.delete(`/projects/${id}`);

      setProjects(
        projects.filter((p) => p.id !== id)
      );

      if (selectedProject?.id === id) {
        setSelectedProject(null);
        setProjectMembers([]);
      }

      alert("Project deleted!");
    } catch (error) {
      console.error(
        "Delete project error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          "Error deleting project"
      );
    }
  };

  // ================= START EDIT =================
  const startEdit = (project) => {
    setNewProject({
      title: project.title,
      description: project.description || "",
    });

    setEditingId(project.id);
  };

  // ================= OPEN MEMBERS =================
  const openMembers = async (project) => {
    setSelectedProject(project);
    setSelectedUserId("");
    setMembersLoading(true);

    try {
      const res = await api.get("/project-members", {
        params: {
          project_id: project.id,
        },
      });

      setProjectMembers(res.data);
    } catch (error) {
      console.error(
        "Fetch project members error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          "Failed to load project members"
      );
    } finally {
      setMembersLoading(false);
    }
  };

  // ================= ADD MEMBER =================
  const addMember = async () => {
    if (!selectedUserId) {
      return alert("Please select a user!");
    }

    try {
      await api.post("/project-members", {
        project_id: selectedProject.id,
        user_id: selectedUserId,
      });

      alert("Member added successfully! 👥");

      setSelectedUserId("");

      // Refresh members
      const res = await api.get("/project-members", {
        params: {
          project_id: selectedProject.id,
        },
      });

      setProjectMembers(res.data);
    } catch (error) {
      console.error(
        "Add member error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          "Error adding member"
      );
    }
  };

  // ================= REMOVE MEMBER =================
  const removeMember = async (memberId) => {
    if (
      !confirm(
        "Are you sure you want to remove this member?"
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/project-members/${memberId}`
      );

      setProjectMembers(
        projectMembers.filter(
          (member) => member.id !== memberId
        )
      );

      alert("Member removed successfully!");
    } catch (error) {
      console.error(
        "Remove member error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          "Error removing member"
      );
    }
  };

  return (
    <div className="p-10">

      {/* ================= PAGE HEADING ================= */}
      <h2 className="text-5xl font-extrabold text-white mb-12 text-center drop-shadow-2xl">
        Projects 📁
      </h2>

      {/* ================= CREATE / EDIT FORM ================= */}
      {isAdmin && (
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl mb-12 max-w-4xl mx-auto">

          <h3 className="text-2xl font-bold text-white mb-6">
            {editingId
              ? "Edit Project"
              : "Create New Project"}
          </h3>

          <input
            name="title"
            placeholder="Project Title"
            value={newProject.title}
            onChange={handleChange}
            className="input mb-4"
            disabled={loading}
          />

          <textarea
            name="description"
            placeholder="Description (optional)"
            value={newProject.description}
            onChange={handleChange}
            className="w-full px-6 py-4 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-4 focus:ring-white/50 transition mb-6 h-32 resize-none"
            disabled={loading}
          />

          <button
            onClick={
              editingId
                ? () => updateProject(editingId)
                : createProject
            }
            disabled={loading}
            className="btn-primary"
          >
            {loading
              ? "Saving..."
              : editingId
              ? "Update Project"
              : "Create Project"}
          </button>

          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);

                setNewProject({
                  title: "",
                  description: "",
                });
              }}
              className="ml-4 px-6 py-3 bg-gray-600 rounded-xl hover:bg-gray-700 transition"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* ================= PROJECT LIST ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">

        {projects.length === 0 ? (
          <p className="text-white/70 text-center col-span-full text-2xl mt-20">
            No projects yet. Create your first one! 🚀
          </p>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl transform transition hover:scale-105 hover:shadow-purple-500/50"
            >

              {/* PROJECT TITLE */}
              <h3 className="text-3xl font-extrabold text-white mb-4 drop-shadow-md">
                {project.title || "Untitled Project"}
              </h3>

              {/* DESCRIPTION */}
              <p className="text-white/80 mb-8 leading-relaxed">
                {project.description ||
                  "No description provided."}
              </p>

              {/* ================= MANAGE MEMBERS ================= */}
              <button
                onClick={() => openMembers(project)}
                className="w-full mb-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition"
              >
                👥 Manage Members
              </button>

              {/* ================= ADMIN BUTTONS ================= */}
              {isAdmin && (
                <div className="flex gap-4">

                  <button
                    onClick={() =>
                      startEdit(project)
                    }
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition"
                  >
                    Edit ✏️
                  </button>

                  <button
                    onClick={() =>
                      deleteProject(project.id)
                    }
                    className="flex-1 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition"
                  >
                    Delete 🗑️
                  </button>

                </div>
              )}

            </div>
          ))
        )}

      </div>

      {/* ================= MEMBERS MODAL ================= */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">

          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-3xl border border-white/20 shadow-2xl p-8">

            {/* MODAL HEADER */}
            <div className="flex justify-between items-center mb-8">

              <div>
                <h3 className="text-3xl font-bold text-white">
                  Project Members 👥
                </h3>

                <p className="text-white/60 mt-2">
                  {selectedProject.title}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedProject(null);
                  setProjectMembers([]);
                  setSelectedUserId("");
                }}
                className="text-white/70 hover:text-white text-3xl"
              >
                ✕
              </button>

            </div>

            {/* ================= ADD MEMBER - ADMIN ONLY ================= */}
            {isAdmin && (
              <div className="mb-8 p-5 bg-white/10 rounded-2xl border border-white/10">

                <h4 className="text-lg font-bold text-white mb-4">
                  Add Member
                </h4>

                <div className="flex gap-3">

                  <select
                    value={selectedUserId}
                    onChange={(e) =>
                      setSelectedUserId(e.target.value)
                    }
                    className="flex-1 px-4 py-3 rounded-xl bg-white text-black focus:outline-none"
                  >
                    <option value="">
                      Select User
                    </option>

                    {users
                      .filter(
                        (user) =>
                          !projectMembers.some(
                            (member) =>
                              member.user_id === user.id
                          )
                      )
                      .map((user) => (
                        <option
                          key={user.id}
                          value={user.id}
                        >
                          {user.name} ({user.role})
                        </option>
                      ))}
                  </select>

                  <button
                    onClick={addMember}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition"
                  >
                    Add
                  </button>

                </div>

              </div>
            )}

            {/* ================= MEMBERS LIST ================= */}
            <div>

              <h4 className="text-xl font-bold text-white mb-4">
                Members ({projectMembers.length})
              </h4>

              {membersLoading ? (
                <p className="text-white/70">
                  Loading members...
                </p>
              ) : projectMembers.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-white/60 text-lg">
                    No members added yet.
                  </p>

                  {isAdmin && (
                    <p className="text-white/40 text-sm mt-2">
                      Add members using the dropdown above.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">

                  {projectMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between bg-white/10 border border-white/10 rounded-xl p-4"
                    >

                      <div>
                        <p className="text-white font-semibold">
                          👤 {member.name}
                        </p>

                        <p className="text-white/50 text-sm">
                          {member.email}
                        </p>

                        <span className="text-xs text-purple-300">
                          {member.role}
                        </span>
                      </div>

                      {/* REMOVE - ADMIN ONLY */}
                      {isAdmin && (
                        <button
                          onClick={() =>
                            removeMember(member.id)
                          }
                          className="px-4 py-2 bg-red-600/80 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition"
                        >
                          Remove
                        </button>
                      )}

                    </div>
                  ))}

                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}