import { useState, useEffect } from 'react';
import { Box } from '@mui/material';

const ImageCarousel = ({ images, interval = 4000, children,  fit = 'contain', height, position = 'center center' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: height || { xs: 'calc(100vh - 56px)', md: 'calc(100vh - 64px)' },
        overflow: 'hidden',
        bgcolor: '#000' 
      }}
    >
      {/* Image Container */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: 'transform 1s ease-in-out'
        }}
      >
        {images.map((image, index) => (
          <Box
            key={index}
            sx={{
              minWidth: '100%',
              height: '100%',
              backgroundImage: `url(${image})`,
              backgroundSize: fit,             
              backgroundPosition: position, 
              backgroundRepeat: 'no-repeat'
            }}
          />
        ))}
      </Box>

      {/* Overlay for text content */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1
        }}
      >
        {children}
      </Box>

      {/* Carousel Indicators */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
          zIndex: 2
        }}
      >
        {images.map((_, index) => (
          <Box
            key={index}
            onClick={() => setCurrentIndex(index)}
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: currentIndex === index ? 'white' : 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease'
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ImageCarousel;