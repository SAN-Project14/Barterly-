import React from 'react';
import { 
  Tv, 
  Headphones, 
  Camera, 
  Gamepad2, 
  Home, 
  Shirt, 
  Trophy, 
  BookOpen, 
  Sparkles,
  Layers
} from 'lucide-react';

interface CategoryIconProps {
  category: string;
  className?: string;
}

export function CategoryIcon({ category, className = "w-4 h-4 shrink-0" }: CategoryIconProps) {
  switch (category) {
    case 'Electronics':
      return <Tv className={className} />;
    case 'Audio & Music':
      return <Headphones className={className} />;
    case 'Photography':
      return <Camera className={className} />;
    case 'Gaming & Consoles':
      return <Gamepad2 className={className} />;
    case 'Home & Kitchen':
      return <Home className={className} />;
    case 'Fashion & Apparel':
      return <Shirt className={className} />;
    case 'Sports & Outdoors':
      return <Trophy className={className} />;
    case 'Books & Collectibles':
      return <BookOpen className={className} />;
    case 'All Categories':
      return <Layers className={className} />;
    default:
      return <Sparkles className={className} />;
  }
}
