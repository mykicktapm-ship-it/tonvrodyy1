import React from 'react'
import { HStack, Text, Box, Spacer } from '@chakra-ui/react'
import LanguageSwitcher from './LanguageSwitcher'
import { motion } from 'framer-motion'

/**
 * AppBar — верхняя панель с радиальным световым ореолом и эффектом стекла.
 * Подсветка активируется при взаимодействии, создавая эффект мягкой эмиссии.
 */

const MotionBox = motion(Box)

export default function AppBar() {
  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      w="100%"
      zIndex="50"
      bg="rgba(10, 10, 25, 0.6)"
      backdropFilter="blur(20px) saturate(180%)"
      borderBottom="1px solid rgba(255,255,255,0.12)"
      boxShadow="0 8px 30px rgba(0,0,0,0.4)"
    >
      <HStack justify="space-between" px={6} py={3}>
        <Text fontSize="lg" fontWeight="bold" color="cyan.200" letterSpacing="wider">
          TONRODY
        </Text>
        <Spacer />
        <LanguageSwitcher />
        <MotionBox
          w="100px"
          h="36px"
          borderRadius="full"
          bgGradient="radial(rgba(255,0,150,0.25), transparent 70%)"
          filter="blur(20px)"
          animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </HStack>

      {/* подсветка вдоль низа панели */}
      <Box
        position="absolute"
        bottom="0"
        left="0"
        w="100%"
        h="2px"
        bgGradient="linear(to-r, rgba(0,255,255,0.2), rgba(255,0,150,0.4), rgba(0,255,255,0.2))"
        filter="blur(2px)"
      />
    </Box>
  )
}
