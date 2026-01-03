import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { Plus, Folder, Calendar, User, Trash2, X, Loader2, ArrowRight } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/projects');
      setProjects(res.data.data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/projects', newProject);
      toast.success('Project Created!');
      setNewProject({ name: '', description: '' });
      setShowForm(false);
      fetchProjects();
    } catch (error) {
      toast.error('Error creating project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (e, projectId) => {
    e.preventDefault(); // Stop clicking the card link
    if (!window.confirm("Are you sure you want to delete this project? This cannot be undone.")) return;
    
    try {
      await api.delete(`/projects/${projectId}`);
      toast.success('Project Deleted');
      fetchProjects();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center h-96 text-slate-400 gap-3">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      <p className="text-sm font-medium animate-pulse">Loading Projects...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Projects</h1>
          <p className="text-slate-500 mt-2 text-base">Manage your ongoing work and team collaboration</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-semibold shadow-sm ${
            showForm 
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/30'
          }`}
        >
          {showForm ? 'Cancel' : <><Plus className="h-5 w-5" /> New Project</>}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-100 animate-in slide-in-from-top-4 duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h2 className="text-xl font-bold text-slate-900">Create New Project</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Project Name</label>
              <input 
                className="w-full border border-slate-200 bg-slate-50 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 text-slate-900"
                placeholder="e.g. Q3 Marketing Campaign"
                value={newProject.name}
                onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
              <textarea 
                className="w-full border border-slate-200 bg-slate-50 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 text-slate-900 resize-none"
                placeholder="Briefly describe the project goals and objectives..."
                rows="3"
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-8 py-2.5 rounded-xl hover:bg-blue-700 font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <Link to={`/projects/${project.id}`} key={project.id} className="group block h-full">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 h-full flex flex-col relative overflow-hidden">
              
              {/* Card Header with Delete Button */}
              <div className="flex justify-between items-start mb-5">
                <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-lg group-hover:shadow-blue-500/30">
                  <Folder className="h-6 w-6" />
                </div>
                <div className="flex gap-3 items-start">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide border ${
                    project.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-slate-50 text-slate-500 border-slate-100'
                  }`}>
                    {project.status}
                  </span>
                  <button 
                    onClick={(e) => handleDelete(e, project.id)}
                    className="h-8 w-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all z-10 opacity-0 group-hover:opacity-100"
                    title="Delete Project"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                {project.name}
                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-blue-500" />
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-6 flex-1">
                {project.description || "No description provided."}
              </p>
              
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-medium text-slate-400">
                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                  <User className="h-3.5 w-3.5 text-slate-500" />
                  <span className="truncate max-w-[100px]">{project.creator?.fullName || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {projects.length === 0 && !isLoading && !showForm && (
        <div className="text-center py-24 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <div className="bg-white p-4 rounded-full inline-flex mb-4 shadow-sm">
            <Folder className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No projects yet</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">Get started by creating your first project to track tasks and collaborate with your team.</p>
          <button 
            onClick={() => setShowForm(true)}
            className="mt-6 inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl hover:border-blue-300 hover:text-blue-600 font-medium transition-all shadow-sm hover:shadow"
          >
            <Plus className="h-4 w-4" /> Create Project
          </button>
        </div>
      )}
    </div>
  );
}