import { useNavigate } from 'react-router-dom';
import Planning from './Planning';
import '../styles/Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Supprimer le token du localStorage
    localStorage.removeItem('token');
    // Rediriger vers la page de connexion
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Tableau de bord</h1>
        <button onClick={handleLogout} className="logout-button">
          Se déconnecter
        </button>
      </header>
      <main className="dashboard-content">
        <h2>Planning des cours</h2>
        <Planning />
      </main>
    </div>
  );
}

export default Dashboard; 