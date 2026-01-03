import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Folder, CheckCircle, Clock, Plus, Activity, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ 
    activeProjects: 0, 
    completedTasks: 0, 
    pendingTasks: 0 
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- SAFE USER PARSING (Prevents White Screen Crash) ---
  let user = { fullName: 'User' };
  try {
    const storedUser = localStorage.getItem('user');
    // Check if data exists and is NOT the string "undefined"
    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      user = JSON.parse(storedUser);
    }
  } catch (err) {
    console.warn("Corrupted user data in Dashboard, using default.");
  }
  // ------------------------------------------------------

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch Projects
        const projectsRes = await api.get('/projects');
        const projects = projectsRes.data.data || [];

        // Simple Stats Calculation
        const activeProjects = projects.filter(p => p.status === 'active').length;
        
        setStats({
          activeProjects,
          completedTasks: 0, 
          pendingTasks: 0    
        });

        setRecentProjects(projects.slice(0, 3)); 
        setLoading(false);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        // Don't show error if it's just a 401 (auth) issue, let the router handle redirect
        if (err.response && err.response.status !== 401) {
            setError("Failed to load dashboard data.");
        }
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-96 text-slate-400 gap-3">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      <p className="text-sm font-medium animate-pulse">Loading Workspace...</p>
    </div>
  );

  if (error) return (
    <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 shadow-sm flex items-center justify-center">
      <p className="font-medium">{error}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-2 border-b border-gray-200/60">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, {user.fullName}!</h1>
          <p className="text-slate-500 mt-2 text-base">Here's what's happening in your workspace today.</p>
        </div>
        <Link 
          to="/projects" 
          className="group flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-200 font-semibold text-sm"
        >
          <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" /> 
          New Project
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow duration-200 group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-1">Active Projects</p>
              <h3 className="text-3xl font-bold text-slate-900">{stats.activeProjects}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
              <Folder className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-medium text-slate-400">
            <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded mr-2">+2.5%</span> 
            from last month
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow duration-200 group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-1">Completed Tasks</p>
              <h3 className="text-3xl font-bold text-slate-900">{stats.completedTasks}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-medium text-slate-400">
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mr-2">+12%</span> 
            productivity
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow duration-200 group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-1">Pending Tasks</p>
              <h3 className="text-3xl font-bold text-slate-900">{stats.pendingTasks}</h3>
            </div>
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-colors duration-200">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-medium text-slate-400">
            <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded mr-2">Action needed</span> 
            on 3 items
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" /> 
            Recent Activity
          </h2>
          <Link to="/projects" className="text-sm text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 group">
            View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="p-2">
          {recentProjects.length > 0 ? (
            <div className="space-y-1">
              {recentProjects.map((project) => (
                <Link to={`/projects/${project.id}`} key={project.id} className="block group">
                  <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors duration-200">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold text-lg group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
                        {project.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{project.name}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          Updated {new Date(project.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${
                        project.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {project.status}
                      </span>
                      <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Folder className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-slate-900 font-medium">No projects yet</p>
              <p className="text-slate-500 text-sm mt-1">Create your first project to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}