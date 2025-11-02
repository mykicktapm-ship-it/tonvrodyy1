import React, { useMemo } from 'react';
import { Heading, Table, Tbody, Td, Th, Thead, Tr, VStack } from '@chakra-ui/react';
import GlassContainer from '../components/GlassContainer';
import { useTranslation } from '../LanguageContext';

export default function HistoryPage() {
  const { t } = useTranslation();
  const rows = useMemo(() => [
    { id: 'g1', date: '2025-10-30', result: '+0.5 TON' },
    { id: 'g2', date: '2025-10-28', result: '-1 TON' },
  ], []);
  return (
    <VStack spacing={6} align="stretch" pt={20} pb={24} px={4}>
      <GlassContainer>
        <Heading size="md">{t('general.history')}</Heading>
      </GlassContainer>
      <GlassContainer overflowX="auto">
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>{t('home.last24h')}</Th>
              <Th>Δ TON</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map(r => (
              <Tr key={r.id}>
                <Td>{r.id}</Td>
                <Td>{r.date}</Td>
                <Td>{r.result}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </GlassContainer>
    </VStack>
  );
}

