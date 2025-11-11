import React, { useCallback, useEffect, useState } from 'react';
import { Heading, Table, Tbody, Td, Th, Thead, Tr, VStack, Text } from '@chakra-ui/react';
import GlassContainer from '../components/GlassContainer';
import { useTranslation } from '../LanguageContext';
import { useAppUserId } from '../hooks/useAppUserId';
import { useUserSocket } from '../hooks/useUserSocket';

export default function HistoryPage() {
  const { t } = useTranslation();
  const userId = useAppUserId();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const load = useCallback(async () => {
    const backend = (import.meta as any).env.VITE_BACKEND_URL || '';
    if (!userId) return;
    setLoading(true);
    try {
      const r = await fetch(`${String(backend).replace(/\/$/, '')}/api/users/${userId}/history`);
      const data = await r.json();
      setPayments(data?.payments || []);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  useUserSocket(userId, () => {
    load();
  });
  return (
    <VStack spacing={6} align="stretch" pt={20} pb={24} px={4}>
      <GlassContainer>
        <Heading size="md">{t('general.history')}</Heading>
      </GlassContainer>
      <GlassContainer overflowX="auto">
        {loading && <Text fontSize="sm">{t('general.loading')}</Text>}
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Type</Th>
              <Th>Status</Th>
              <Th isNumeric>Amount</Th>
              <Th>Date</Th>
            </Tr>
          </Thead>
          <Tbody>
            {payments.map((p, idx) => (
              <Tr key={idx}>
                <Td>{p.type}</Td>
                <Td>{p.status}</Td>
                <Td isNumeric>{p.amount}</Td>
                <Td>{p.created_at}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </GlassContainer>
    </VStack>
  );
}
