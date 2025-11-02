import React from 'react'
import { Flex, IconButton } from '@chakra-ui/react'
import { FiHome, FiActivity, FiTrendingUp, FiClock } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'

/**
 * NavBar — нижняя панель навигации с эффектом гравитационного стекла.
 * Панель слегка искривлена и подсвечивается отражением света от чёрной дыры.
 * Обновлена для включения более сильного взаимодействия с центральной сингулярностью (TONRODY).
 */
export default function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()

  const buttons = [
    { icon: FiHome, path: '/', label: 'Home' },
    { icon: FiActivity, path: '/laboratory', label: 'Lab' },
    { icon: FiTrendingUp, path: '/earn', label: 'Earn' },
    { icon: FiClock, path: '/history', label: 'History' },
  ]

  return (
    <Flex
      as="nav"
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      height="70px"
      align="center"
      justify="space-around"
      bg="rgba(10, 15, 25, 0.65)"
      borderTop="1px solid rgba(120, 150, 255, 0.2)"
      boxShadow="inset 0 0 40px rgba(120, 100, 255, 0.3), 0 0 60px rgba(80, 160, 255, 0.15)"
      backdropFilter="blur(24px) saturate(200%)"
      zIndex={100}
      _before={{
        content: '""',
        position: 'absolute',
        top: '-30px',
        left: '-20%',
        right: '-20%',
        height: '160%',
        background:
          'radial-gradient(ellipse at 50% 130%, rgba(255, 80, 255, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
        filter: 'blur(60px)',
        opacity: 0.6,
        pointerEvents: 'none',
        zIndex: -1,
      }}
      _after={{
        content: '""',
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.04) 0%, transparent 80%)',
        opacity: 0.7,
        zIndex: -2,
      }}
      transition="all 0.4s ease"
    >
      {buttons.map(({ icon: Icon, path, label }) => {
        const active = location.pathname === path
        return (
          <IconButton
            key={path}
            aria-label={label}
            icon={<Icon size={22} />}
            onClick={() => navigate(path)}
            color={active ? 'white' : 'rgba(160,180,255,0.7)'}
            bg={active ? 'rgba(50,100,255,0.3)' : 'transparent'}
            boxShadow={active ? '0 0 25px rgba(120,160,255,0.4)' : 'none'}
            _hover={{ color: 'white', transform: 'scale(1.1)' }}
            transition="all 0.3s ease"
            borderRadius="full"
            size="lg"
          />
        )
      })}
    </Flex>
  )
}
