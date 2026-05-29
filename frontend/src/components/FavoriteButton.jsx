import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const FavoriteButton = ({ propertyId, size = 'text-2xl' }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            checkFavoriteStatus();
        }
    }, [user, propertyId]);

    const checkFavoriteStatus = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/users/favorites', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const isFav = data.favorites.some(fav => fav._id === propertyId);
            setIsFavorite(isFav);
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggle = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        if (!user) {
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.post(
                `http://localhost:5000/api/users/favorites/${propertyId}`,
                {},
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setIsFavorite(data.isFavorite);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`${size} transition-all duration-300 ${
                isFavorite ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-400'
            }`}
        >
            {isFavorite ? '❤️' : '🤍'}
        </button>
    );
};

export default FavoriteButton;