import { useState } from 'react';

const StarRating = ({ rating, onRate, interactive = true, size = 'text-2xl' }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    onClick={() => interactive && onRate && onRate(star)}
                    onMouseEnter={() => interactive && setHover(star)}
                    onMouseLeave={() => interactive && setHover(0)}
                    className={`${size} ${interactive ? 'cursor-pointer transition-transform hover:scale-125' : ''}`}
                    style={{ color: (hover || rating) >= star ? '#f59e0b' : '#d1d5db' }}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

export default StarRating;