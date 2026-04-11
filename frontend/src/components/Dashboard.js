import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Dashboard = ({ onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userName, setUserName] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const [filter, setFilter] = useState('all');

  // Fetch tasks - defined with useCallback
  const fetchTasks = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      onLogout();
      return;
    }
    try {
      const response = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (error.response?.status === 401) {
        onLogout();
      }
    }
  }, [onLogout]);

  // Initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      onLogout();
      return;
    }
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(userData.name || 'User');
    fetchTasks();
  }, [onLogout, fetchTasks]);

  // Add task
  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      onLogout();
      return;
    }
    
    try {
      await axios.post('http://localhost:5000/api/tasks', 
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle('');
      setDescription('');
      setShowDescription(false);
      fetchTasks(); // Refresh the task list
    } catch (error) {
      console.error('Error adding task:', error);
      alert(error.response?.data?.message || 'Failed to add task');
    }
  };

  // Toggle complete status
  const toggleComplete = async (task) => {
    const token = localStorage.getItem('token');
    if (!token) {
      onLogout();
      return;
    }
    
    try {
      await axios.put(`http://localhost:5000/api/tasks/${task._id}`,
        { completed: !task.completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTasks(); // Refresh the task list
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      onLogout();
      return;
    }
    
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks(); // Refresh the task list
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  // Filter logic
  const getFilteredTasks = () => {
    if (filter === 'active') {
      return tasks.filter(task => !task.completed);
    }
    if (filter === 'completed') {
      return tasks.filter(task => task.completed);
    }
    return tasks;
  };

  const filteredTasks = getFilteredTasks();
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks === 0 ? 0 : ((completedTasks / totalTasks) * 100).toFixed(0);

  return (
    <div style={styles.container}>
      {/* Animated Gradient Background */}
      <div style={styles.bgAnimation}>
        <div style={styles.gradientBg}></div>
        <div style={styles.overlay}></div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.logo}>
              <span style={styles.logoIcon}>🚀</span> TaskFlow
              <span style={styles.logoBadge}>Pro</span>
            </h1>
            <p style={styles.tagline}>Organize • Track • Achieve</p>
          </div>
          <div style={styles.userSection}>
            <div style={styles.userInfo}>
              <div style={styles.avatar}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={styles.userName}>{userName}</div>
                <div style={styles.userEmail}>Premium User</div>
              </div>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              <span>🚪</span> Sign Out
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div className="stat-card" style={{...styles.statCard, borderTop: '3px solid #667eea'}}>
            <div style={styles.statIcon}>📊</div>
            <div style={styles.statNumber}>{totalTasks}</div>
            <div style={styles.statLabel}>Total Tasks</div>
            <div style={styles.statProgress}>
              <div style={{...styles.progressBar, width: `${completionRate}%`, background: '#667eea'}}></div>
            </div>
          </div>
          <div className="stat-card" style={{...styles.statCard, borderTop: '3px solid #f093fb'}}>
            <div style={styles.statIcon}>⏳</div>
            <div style={styles.statNumber}>{pendingTasks}</div>
            <div style={styles.statLabel}>In Progress</div>
            <div style={styles.statTrend}>Need focus</div>
          </div>
          <div className="stat-card" style={{...styles.statCard, borderTop: '3px solid #4ade80'}}>
            <div style={styles.statIcon}>✅</div>
            <div style={styles.statNumber}>{completedTasks}</div>
            <div style={styles.statLabel}>Completed</div>
            <div style={styles.statTrend}>Great job! 🎉</div>
          </div>
        </div>

        {/* Add Task Form */}
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>
              <span>✨</span> Create New Task
            </h2>
            <button 
              type="button" 
              onClick={() => setShowDescription(!showDescription)}
              style={styles.toggleDescBtn}
            >
              {showDescription ? '📝 Hide Details' : '📝 Add Details'}
            </button>
          </div>
          <form onSubmit={addTask}>
            <div style={styles.inputWrapper}>
              <input
                type="text"
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={styles.input}
              />
            </div>
            {showDescription && (
              <div style={styles.inputWrapper}>
                <textarea
                  placeholder="Add description, notes, or subtasks..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={styles.textarea}
                  rows="3"
                />
              </div>
            )}
            <button type="submit" style={styles.addBtn}>
              <span>+</span> Add Task
            </button>
          </form>
        </div>

        {/* Task List */}
        <div style={styles.taskSection}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>📋 Your Tasks</h2>
              <p style={styles.sectionSubtitle}>{tasks.length} total • {completedTasks} completed</p>
            </div>
            <div style={styles.filterChips}>
              <span 
                style={{...styles.chip, ...(filter === 'all' ? styles.activeChip : {})}}
                onClick={() => setFilter('all')}
              >
                All ({tasks.length})
              </span>
              <span 
                style={{...styles.chip, ...(filter === 'active' ? styles.activeChip : {})}}
                onClick={() => setFilter('active')}
              >
                Active ({pendingTasks})
              </span>
              <span 
                style={{...styles.chip, ...(filter === 'completed' ? styles.activeChip : {})}}
                onClick={() => setFilter('completed')}
              >
                Completed ({completedTasks})
              </span>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🎯</div>
              <h3>No {filter !== 'all' ? filter : ''} tasks</h3>
              <p>
                {filter === 'active' ? 'Great job! All tasks are completed!' : 
                 filter === 'completed' ? 'Complete some tasks to see them here!' : 
                 'Create your first task above to get started'}
              </p>
            </div>
          ) : (
            <div style={styles.taskList}>
              {filteredTasks.map((task) => (
                <div key={task._id} className="task-card" style={styles.taskCard}>
                  <div style={styles.taskContent}>
                    <div style={styles.taskHeader}>
                      <div style={styles.taskLeft}>
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleComplete(task)}
                          style={styles.checkbox}
                        />
                        <div style={styles.taskInfo}>
                          <h3 style={task.completed ? styles.completedTitle : styles.taskTitle}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p style={task.completed ? styles.completedDesc : styles.taskDesc}>
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <button onClick={() => deleteTask(task._id)} style={styles.deleteBtn}>
                        🗑️
                      </button>
                    </div>
                    <div style={styles.taskFooter}>
                      <div style={styles.taskDate}>
                        <span>📅</span>
                        {new Date(task.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div style={styles.taskTime}>
                        <span>⏰</span>
                        {new Date(task.createdAt).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}
                      </div>
                      {task.completed && (
                        <div style={styles.completedBadge}>✓ Completed</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Styles object (keep your existing styles here)
const styles = {
  container: {
    minHeight: '100vh',
    position: 'relative',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: '#474a4f',
  },
  bgAnimation: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  gradientBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #0a0b0e 0%, #764ba2 50%, #080209 100%)',
    backgroundSize: '200% 200%',
    animation: 'gradientShift 10s ease infinite',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    background: 'rgba(255, 255, 255, 0.92)',
  },
  content: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: '700px',
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '2rem',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #f0f0f0',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  logo: {
    fontSize: '1.8rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  logoIcon: {
    fontSize: '1.8rem',
  },
  logoBadge: {
    fontSize: '0.7rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '0.2rem 0.6rem',
    borderRadius: '20px',
    marginLeft: '0.5rem',
  },
  tagline: {
    color: '#666',
    marginTop: '0.25rem',
    fontSize: '0.8rem',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  avatar: {
    width: '45px',
    height: '45px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1.2rem',
  },
  userName: {
    fontWeight: '700',
    color: '#333',
    fontSize: '0.9rem',
  },
  userEmail: {
    fontSize: '0.7rem',
    color: '#667eea',
    fontWeight: '600',
  },
  logoutBtn: {
    padding: '0.6rem 1.2rem',
    background: 'linear-gradient(135deg, #f56565 0%, #ed64a6 100%)',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    padding: '1rem',
    borderRadius: '16px',
    transition: 'all 0.3s',
    cursor: 'pointer',
    backgroundColor: 'white',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  statIcon: {
    fontSize: '1.5rem',
    marginBottom: '0.5rem',
  },
  statNumber: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '0.25rem',
  },
  statLabel: {
    color: '#666',
    fontSize: '0.8rem',
    fontWeight: '500',
    marginBottom: '0.5rem',
  },
  statProgress: {
    height: '4px',
    background: '#f0f0f0',
    borderRadius: '2px',
    overflow: 'hidden',
    marginTop: '0.5rem',
  },
  progressBar: {
    height: '100%',
    transition: 'width 0.3s',
  },
  statTrend: {
    fontSize: '0.7rem',
    color: '#4ade80',
    fontWeight: '600',
    marginTop: '0.25rem',
  },
  formCard: {
    background: '#f8f9fa',
    padding: '1.5rem',
    borderRadius: '16px',
    marginBottom: '2rem',
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  formTitle: {
    fontSize: '1.1rem',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  toggleDescBtn: {
    padding: '0.4rem 0.8rem',
    background: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    color: '#667eea',
    transition: 'all 0.3s',
  },
  inputWrapper: {
    marginBottom: '1rem',
  },
  input: {
    width: '100%',
    padding: '0.8rem 1rem',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    fontSize: '0.95rem',
    transition: 'all 0.3s',
    fontFamily: 'inherit',
  },
  textarea: {
    width: '100%',
    padding: '0.8rem 1rem',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    transition: 'all 0.3s',
  },
  addBtn: {
    width: 'auto',
    minWidth: '120px',
    padding: '0.5rem 1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    transition: 'all 0.3s',
  },
  taskSection: {
    background: 'white',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    color: '#333',
    margin: 0,
  },
  sectionSubtitle: {
    fontSize: '0.8rem',
    color: '#666',
    marginTop: '0.25rem',
  },
  filterChips: {
    display: 'flex',
    gap: '0.5rem',
  },
  chip: {
    padding: '0.3rem 0.8rem',
    background: '#f0f0f0',
    borderRadius: '20px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  activeChip: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    maxHeight: '500px',
    overflowY: 'auto',
  },
  taskCard: {
    background: '#f8f9fa',
    borderRadius: '12px',
    padding: '1rem',
    transition: 'all 0.3s',
    border: '1px solid #e0e0e0',
  },
  taskContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskLeft: {
    display: 'flex',
    gap: '0.75rem',
    flex: 1,
  },
  checkbox: {
    width: '20px',
    height: '20px',
    marginTop: '2px',
    cursor: 'pointer',
    accentColor: '#667eea',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: '600',
    color: '#333',
  },
  completedTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: '600',
    color: '#aaa',
    textDecoration: 'line-through',
  },
  taskDesc: {
    margin: '0.5rem 0 0 0',
    color: '#666',
    fontSize: '0.85rem',
    lineHeight: '1.4',
  },
  completedDesc: {
    margin: '0.5rem 0 0 0',
    color: '#bbb',
    fontSize: '0.85rem',
    textDecoration: 'line-through',
  },
  deleteBtn: {
    background: 'rgba(245, 101, 101, 0.1)',
    border: 'none',
    padding: '0.4rem 0.6rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s',
    color: '#f56565',
  },
  taskFooter: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    paddingTop: '0.5rem',
    borderTop: '1px solid #e0e0e0',
    fontSize: '0.7rem',
    color: '#999',
  },
  taskDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  taskTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  completedBadge: {
    background: '#4ade80',
    color: 'white',
    padding: '0.2rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: '600',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#999',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
};

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  .stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
  
  .task-card:hover {
    transform: translateX(5px);
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
  }
  
  .logout-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(245, 101, 101, 0.3);
  }
  
  .add-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
  
  .delete-btn:hover {
    transform: scale(1.1);
    background: rgba(245, 101, 101, 0.2);
  }
  
  input:focus, textarea:focus {
    border-color: #667eea !important;
    outline: none;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  .chip:hover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    transform: translateY(-2px);
  }
  
  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
  }
  
  /* Smooth Transitions */
  * {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;
document.head.appendChild(styleSheet);

export default Dashboard;