import { useState, useEffect } from 'react';
import API from '../utils/api'; // ✅ Swapped axios for your API utility
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
            // ✅ Removed localhost and headers
            const { data } = await API.get('/users/favorites');
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
            // ✅ Removed localhost and headers
            const { data } = await API.post(`/users/favorites/${propertyId}`);
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