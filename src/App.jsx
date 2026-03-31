import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { motion } from "framer-motion";

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
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-1/3"
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
          <Card>
            <CardContent>
              <p>Total Projects</p>
              <h2 className="text-2xl font-bold">{projects.length}</h2>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p>Active</p>
              <h2 className="text-2xl font-bold">
                {projects.filter((p) => p.status === "Active").length}
              </h2>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p>Delayed</p>
              <h2 className="text-2xl font-bold">
                {projects.filter((p) => p.status === "Delayed").length}
              </h2>
            </CardContent>
          </Card>
        </div>

        {/* Project Cards */}
        <div className="grid grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <motion.div whileHover={{ scale: 1.05 }} key={project.id}>
              <Card className="rounded-2xl shadow-md">
                <CardContent>
                  <h3 className="font-bold text-lg">{project.name}</h3>
                  <p className="text-sm">Status: {project.status}</p>

                  <div className="w-full bg-gray-200 h-2 rounded mt-2">
                    <div
                      className="bg-blue-500 h-2 rounded"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
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
