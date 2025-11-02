import React from 'react'
import { HStack, IconButton, Box } from '@chakra-ui/react'
import { FiHome, FiTrendingUp, FiActivity } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'

/**
 * NavBar — нижняя панель с энергетическим свечением.
 * Каждая кнопка имеет эмиссивное сияние и мягкую подсветку активного состояния.
 */

export default function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()

  const items = [
    { icon: FiHome, route: '/', label: 'Home' },
    { icon: FiActivity, route: '/laboratory', label: 'Lab' },
    { icon: FiTrendingUp, route: '/earn', label: 'Earn' },
  ]

  return (
    <Box
      position="fixed"
      bottom="0"
      left="0"
      w="100%"
      bg="rgba(10, 10, 20, 0.7)"
      backdropFilter="blur(20px) saturate(180%)"
      borderTop="1px solid rgba(255,255,255,0.1)"
      boxShadow="0 -10px 25px rgba(0,0,0,0.4)"
      zIndex="40"
    >
      <HStack justify="space-around" py={3}>
        {items.map((item, i) => {
          const active = location.pathname === item.route
          return (
            <Box key={i} position="relative">
              {active && (
                <Box
                  position="absolute"
                  top="-30px"
                  left="50%"
                  transform="translateX(-50%)"
                  w="60px"
                  h="60px"
                  borderRadius="full"
                  bgGradient="radial(rgba(255,0,150,0.35), transparent 70%)"
                  filter="blur(25px)"
                  zIndex="0"
                  animation="pulse 3s ease-in-out infinite"
                />
              )}
              <IconButton
                aria-label={item.label}
                icon={<item.icon size="22" />}
                color={active ? 'cyan.200' : 'gray.400'}
                variant="ghost"
                onClick={() => navigate(item.route)}
                _hover={{ color: 'cyan.100', transform: 'scale(1.1)' }}
                transition="all 0.3s ease"
                zIndex="10"
              />
            </Box>
          )
        })}
      </HStack>

      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.3; transform: translateX(-50%) scale(0.9); }
            50% { opacity: 0.8; transform: translateX(-50%) scale(1.1); }
            100% { opacity: 0.3; transform: translateX(-50%) scale(0.9); }
          }
        `}
      </style>
    </Box>
  )
}