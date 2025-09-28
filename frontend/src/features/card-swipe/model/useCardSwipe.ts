import { useState, useRef } from 'react';

export const useCardSwipe = () => {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number>(0);
  const currentX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    currentX.current = e.clientX;
    isDragging.current = true;
    if (cardRef.current) {
      cardRef.current.style.transition = 'none';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !cardRef.current) return;
    
    currentX.current = e.clientX;
    const deltaX = currentX.current - startX.current;
    const rotation = deltaX * 0.1;
    const opacity = Math.max(0.3, 1 - Math.abs(deltaX) / 300);
    
    cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
    cardRef.current.style.opacity = opacity.toString();
    
    if (Math.abs(deltaX) > 50) {
      setSwipeDirection(deltaX > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(null);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging.current || !cardRef.current) return;
    
    isDragging.current = false;
    const deltaX = currentX.current - startX.current;
    
    if (Math.abs(deltaX) > 100) {
      return { action: deltaX > 0 ? 'know' : 'dontKnow' };
    } else {
      cardRef.current.style.transition = 'all 0.3s ease';
      cardRef.current.style.transform = 'translateX(0) rotate(0deg)';
      cardRef.current.style.opacity = '1';
      setSwipeDirection(null);
      return { action: 'cancel' };
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
    isDragging.current = true;
    if (cardRef.current) {
      cardRef.current.style.transition = 'none';
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !cardRef.current) return;
    
    currentX.current = e.touches[0].clientX;
    const deltaX = currentX.current - startX.current;
    const rotation = deltaX * 0.1;
    const opacity = Math.max(0.3, 1 - Math.abs(deltaX) / 300);
    
    cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
    cardRef.current.style.opacity = opacity.toString();
    
    if (Math.abs(deltaX) > 50) {
      setSwipeDirection(deltaX > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(null);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current || !cardRef.current) return;
    
    isDragging.current = false;
    const deltaX = currentX.current - startX.current;
    
    if (Math.abs(deltaX) > 100) {
      return { action: deltaX > 0 ? 'know' : 'dontKnow' };
    } else {
      cardRef.current.style.transition = 'all 0.3s ease';
      cardRef.current.style.transform = 'translateX(0) rotate(0deg)';
      cardRef.current.style.opacity = '1';
      setSwipeDirection(null);
      return { action: 'cancel' };
    }
  };

  const animateSwipe = (direction: 'left' | 'right') => {
    if (!cardRef.current) return;
    
    setIsAnimating(true);
    const rotation = direction === 'right' ? 30 : -30;
    const translateX = direction === 'right' ? '100vw' : '-100vw';
    
    cardRef.current.style.transition = 'all 0.5s ease';
    cardRef.current.style.transform = `translateX(${translateX}) rotate(${rotation}deg)`;
    cardRef.current.style.opacity = '0';
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  const resetCard = () => {
    if (cardRef.current) {
      cardRef.current.style.transition = 'none';
      cardRef.current.style.transform = 'translateX(0) rotate(0deg)';
      cardRef.current.style.opacity = '1';
    }
  };

  return {
    // State
    swipeDirection,
    isAnimating,
    cardRef,
    
    // Handlers
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    
    // Actions
    animateSwipe,
    resetCard,
  };
};
