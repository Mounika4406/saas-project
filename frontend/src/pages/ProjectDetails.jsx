import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { ArrowLeft, Calendar, CheckCircle2, Clock, Trash2, Plus, Loader2, ListTodo, Circle } from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', status: 'todo' });

  const fetchProjectData = async () => {
    try {
      const projectRes = await api.get(`/projects/${id}`);
      setProject(projectRes.data.data);
      
      const tasksRes = await api.get(`/tasks?projectId=${id}`); 
      setTasks(tasksRes.data.data);
      
    } catch (error) {
      toast.error('Failed to load project details');
    }
  };

  useEffect(() => { fetchProjectData(); }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...newTask, projectId: id });
      toast.success('Task added');
      setNewTask({ title: '', status: 'todo' });
      setShowTaskForm(false);
      fetchProjectData();
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Task updated');
      fetchProjectData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      fetchProjectData();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  if (!project) return (
    <div className="flex flex-col justify-center items-center h-96 text-slate-400 gap-3">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      <p className="text-sm font-medium animate-pulse">Loading Project...</p>
    </div>
  );

  const completedCount = tasks.filter(t => t.status === 'done').length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Navigation */}
      <Link 
        to="/projects" 
        className="inline-flex items-center text-slate-500 hover:text-blue-600 transition-colors font-medium group"
      >
        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
        Back to Projects
      </Link>

      {/* Project Header Card */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/60 relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{project.name}</h1>
            <p className="text-slate-500 text-lg leading-relaxed max-w-2xl">{project.description}</p>
            
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <ListTodo className="h-4 w-4 text-slate-400" />
                <span>{tasks.length} Tasks</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4">
             <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide border ${
              project.status === 'active' 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {project.status}
            </span>
            
            {/* Mini Progress Bar */}
            <div className="w-48 text-right">
              <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Tasks <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-sm font-semibold">{tasks.length}</span>
          </h2>
          <button 
            onClick={() => setShowTaskForm(!showTaskForm)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-medium shadow-sm ${
              showTaskForm 
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/20'
            }`}
          >
            {showTaskForm ? 'Cancel' : <><Plus className="h-5 w-5" /> Add Task</>}
          </button>
        </div>

        {/* Task Form */}
        {showTaskForm && (
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 animate-in slide-in-from-top-4 duration-200">
            <form onSubmit={handleCreateTask} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input 
                  className="w-full border border-slate-200 bg-slate-50 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 text-slate-900"
                  placeholder="What needs to be done?"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <select 
                  className="border border-slate-200 bg-slate-50 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 font-medium cursor-pointer min-w-[140px]"
                  value={newTask.status}
                  onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <button className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 font-semibold shadow-md shadow-blue-500/20 transition-all">
                  Save
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Task List */}
        <div className="space-y-3">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className={`group p-4 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                task.status === 'done' 
                  ? 'bg-slate-50/50 border-slate-100 opacity-75' 
                  : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md hover:shadow-slate-200/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl transition-colors ${
                  task.status === 'done' ? 'bg-emerald-100 text-emerald-600' : 
                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  {task.status === 'done' ? <CheckCircle2 className="h-5 w-5" /> : 
                   task.status === 'in_progress' ? <Loader2 className="h-5 w-5 animate-spin" /> : 
                   <Circle className="h-5 w-5" />}
                </div>
                <div>
                  <p className={`font-medium text-base transition-all ${
                    task.status === 'done' ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-900'
                  }`}>
                    {task.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <select 
                    className={`text-sm font-semibold bg-transparent border-none focus:ring-0 cursor-pointer py-1 pl-2 pr-8 rounded-lg transition-colors appearance-none ${
                       task.status === 'done' ? 'text-emerald-600 hover:bg-emerald-50' : 
                       task.status === 'in_progress' ? 'text-blue-600 hover:bg-blue-50' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                    value={task.status}
                    onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div className="w-px h-6 bg-slate-200 mx-1"></div>

                <button 
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Delete Task"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {tasks.length === 0 && !showTaskForm && (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <div className="bg-white p-4 rounded-full inline-flex mb-3 shadow-sm">
                <ListTodo className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-slate-900 font-medium">No tasks yet</h3>
              <p className="text-slate-500 text-sm mt-1">Get started by creating a task above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}