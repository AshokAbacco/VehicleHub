import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export const GuestActionButton = ({ children, className = '', onClick }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (isAuthenticated) {
      onClick?.();
      return;
    }
    navigate('/login');
  };

  return (
    <button onClick={handleClick} className={className}>{children}</button>
  );
};
