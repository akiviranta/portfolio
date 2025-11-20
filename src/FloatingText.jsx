import React, { forwardRef } from 'react';
import { Text } from '@react-three/drei';

const FloatingText = forwardRef(({
    text,
    position = [0, 0, 0],
    rotation = [-Math.PI / 2, 0, 0], // Default flat on ground
    size = 1,
    color = 'white',
    anchorX = 'center',
    anchorY = 'middle'
}, ref) => {
    return (
        <Text
            ref={ref}
            position={position}
            rotation={rotation}
            fontSize={size}
            color={color}
            anchorX={anchorX}
            anchorY={anchorY}
            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff" // Use a nice font
        >
            {text}
        </Text>
    );
});

export default FloatingText;
