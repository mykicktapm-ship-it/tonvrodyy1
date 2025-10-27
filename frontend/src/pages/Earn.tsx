import React, { useMemo } from 'react';
import { Button, Heading, Text, VStack, useToast } from '@chakra-ui/react';
import GlassContainer from '../components/GlassContainer';
import { useUserId } from '../hooks/useUserId';

export default function Earn() {
  const userId = useUserId();
  const toast = useToast();

  const referralLink = useMemo(() => {
    if (!userId) return '';
    const url = new URL(window.location.href);
    url.searchParams.set('ref', userId);
    return url.toString();
  }, [userId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: 'Referral link copied!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Unable to copy',
        description: String(err),
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <VStack spacing={6} align="stretch" pt={16} pb={20} px={4} position="relative">
      <GlassContainer>
        <Heading size="lg" mb={2}>
          Earn &amp; Invite
        </Heading>
        <Text fontSize="sm" mb={4}>
          Share your referral link to invite others and earn rewards in the future.
        </Text>
        {userId ? (
          <>
            <Text fontSize="sm" mb={2}>
              Your referral link:
            </Text>
            <Text
              fontSize="sm"
              mb={4}
              p={2}
              bg="gray.700"
              borderRadius="md"
              wordBreak="break-all"
            >
              {referralLink}
            </Text>
            <Button colorScheme="blue" onClick={handleCopy}>
              Copy Link
            </Button>
          </>
        ) : (
          <Text fontSize="sm">Generating your ID…</Text>
        )}
      </GlassContainer>
    </VStack>
  );
}