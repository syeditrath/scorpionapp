const initialData = [
  {
    id: 1,
    name: "Rastanura Project",
    status: "Active",
    progress: 70,
    equipment: ["Excavator", "Crane", "Drill"]
  },
  {
    id: 2,
    name: "Dammam Phase 2",
    status: "Delayed",
    progress: 45,
    equipment: ["Loader", "Bulldozer"]
  }
];

export default function Dashboard() {
  const [projects] = useState(initialData);
  const [selectedProject, setSelectedProject] = useState("");
  const [search, setSearch] = useState("");

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const currentProject = projects.find((p) => p.name === selectedProject);

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-5 space-y-4">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="opacity-70">Projects</p>
        <p className="opacity-70">Equipment</p>
        <p className="opacity-70">Reports</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <Input
            <input
  type="text"
  placeholder="Search projects..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  style={{
    padding: "10px",
    width: "300px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  }}
/>
          />

          <select
            className="p-2 border rounded"
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option>Select Project</option>
            {projects.map((p) => (
              <option key={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div style={{
  background: "#fff",
  padding: "16px",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
}}>
              <p>Total Projects</p>
              <h2 className="text-2xl font-bold">{projects.length}</h2>
            </div>

          <div style={{
  background: "#fff",
  padding: "16px",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
}}>
              <p>Active</p>
              <h2 className="text-2xl font-bold">
                {projects.filter((p) => p.status === "Active").length}
              </h2>
            </div>

          <div style={{
  background: "#fff",
  padding: "16px",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
}}>
              <p>Delayed</p>
              <h2 className="text-2xl font-bold">
                {projects.filter((p) => p.status === "Delayed").length}
              </h2>
            </div>
        </div>

        {/* Project Cards */}
        <div className="grid grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <div style={{ transition: "0.3s" }}>
              <div style={{
  background: "#fff",
  padding: "16px",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
}}>
                  <h3 className="font-bold text-lg">{project.name}</h3>
                  <p className="text-sm">Status: {project.status}</p>

                  <div className="w-full bg-gray-200 h-2 rounded mt-2">
                    <div
                      className="bg-blue-500 h-2 rounded"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
            </motion.div>
          ))}
        </div>

        {/* Equipment Section */}
        {currentProject && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-3">Equipment</h2>
            <ul className="list-disc pl-5">
              {currentProject.equipment.map((eq, index) => (
                <li key={index}>{eq}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
