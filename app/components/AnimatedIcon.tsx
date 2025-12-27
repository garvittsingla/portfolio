"use client";
import React, { useState, useEffect } from 'react'

const AnimatedIcon = () => {
    const icons = ['💻', '⚡', '🚀', '🔥', '⚙️', '🎯']
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        const interval = setInterval(() => {
            setIsAnimating(true)
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % icons.length)
                setIsAnimating(false)
            }, 300) 
        }, 1500)

        return () => clearInterval(interval)
    }, [icons.length])

    return (
        <div className='relative w-7 h-7 overflow-hidden bg-zinc-100/20 rounded-lg flex p-[4px] items-center justify-center'>
            <span
                className={`absolute text-xs transition-all duration-300 ${
                    isAnimating 
                        ? '-translate-y-6 opacity-0 scale-50 rotate-90' 
                        : 'translate-y-0 opacity-100 scale-100 rotate-0'
                }`}
            >
                {icons[currentIndex]}
            </span>
        </div>
    )
}

export default AnimatedIcon