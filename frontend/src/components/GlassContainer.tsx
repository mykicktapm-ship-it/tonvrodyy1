import React, { ReactNode } from 'react'
import { Box } from '@chakra-ui/react'

/**
 * GlassContainer — интерфейсный стеклянный слой с эффектом светопреломления.
 * Добавлен микрослой блум-свечения и глубинная диффузия, имитирующая свечение плазмы под поверхностью.
 */

interface GlassContainerProps {
  children: ReactNode
  p?: number | string
  [key: string]: any
}

export default function GlassContainer({ children, p = 4, ...props }: GlassContainerProps) {
  return (
    <Box
      p={p}
      borderRadius="2xl"
      bg="rgba(255, 255, 255, 0.05)"
      border="1px solid rgba(255, 255, 255, 0.18)"
      boxShadow="0 0 40px rgba(0, 255, 255, 0.1), inset 0 0 25px rgba(255,255,255,0.05)"
      backdropFilter="blur(20px) saturate(180%)"
      transition="all 0.5s ease"
      _hover={{
        boxShadow:
          '0 0 60px rgba(255, 150, 255, 0.25), inset 0 0 30px rgba(255,255,255,0.08)',
        transform: 'translateY(-1px)',
        borderColor: 'rgba(255, 255, 255, 0.4)',
      }}
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background:
          'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.12), transparent 70%)',
        opacity: 0.8,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }}
      _after={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background:
          'conic-gradient(from 180deg at 50% 50%, rgba(255,0,150,0.05), rgba(0,255,255,0.05), rgba(255,255,255,0.02), rgba(255,0,150,0.05))',
        opacity: 0.5,
        animation: 'rotateGradient 20s linear infinite',
        pointerEvents: 'none',
      }}
      sx={{
        '@keyframes rotateGradient': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      }}
      {...props}
    >
      {children}
    </Box>
  )
}