// src/components/feedback/StarRating.tsx
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({ 
  rating, 
  onRatingChange, 
  disabled = false,
  size = 'lg'
}: StarRatingProps) {
  
  const sizeMap = {
    sm: 'w-4 h-4 sm:w-5 sm:h-5',
    md: 'w-6 h-6 sm:w-7 sm:h-7',
    lg: 'w-8 h-8 sm:w-10 sm:h-10',
  };

  const iconSize = sizeMap[size] || sizeMap.lg;

  return (
    <div className="flex gap-1 sm:gap-1.5 justify-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !disabled && onRatingChange(star)}
          disabled={disabled}
          className={`transition-all duration-200 focus:outline-none ${
            !disabled ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
          }`}
          aria-label={`Rate ${star} stars`}
        >
          <Star
            className={`${iconSize} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]'
                : 'text-gray-600 hover:text-gray-400 transition-colors'
            } transition-all duration-300 ${
              !disabled && star <= rating ? 'animate-pulse' : ''
            }`}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}