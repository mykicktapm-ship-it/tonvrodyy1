import React, { useState } from 'react';
import { Button, HStack, NumberInput, NumberInputField, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useToast } from '@chakra-ui/react';
import { TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useTranslation } from '../../LanguageContext';

function AmountModal({ isOpen, onClose, onConfirm, title }: { isOpen: boolean; onClose: () => void; onConfirm: (amount: number) => void; title: string }) {
  const [value, setValue] = useState<string>('0.5');
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          <NumberInput value={value} min={0.1} step={0.1} onChange={(v) => setValue(v)}>
            <NumberInputField placeholder="TON" />
          </NumberInput>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose}>Cancel</Button>
          <Button colorScheme="blue" onClick={() => onConfirm(parseFloat(value || '0'))}>OK</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function TonWalletControls() {
  const { t } = useTranslation();
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const toast = useToast();
  const treasury = import.meta.env.VITE_TREASURY_ADDRESS as string | undefined;
  const dep = useDisclosure();
  const wdr = useDisclosure();

  const send = async (amount: number, to: string) => {
    try {
      const nanotons = BigInt(Math.floor(amount * 1e9));
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [{ address: to, amount: nanotons.toString() }],
      });
      toast({ title: 'Transaction sent', status: 'success' });
    } catch (e: any) {
      toast({ title: 'Transaction failed', description: String(e?.message || e), status: 'error' });
    }
  };

  if (!wallet) return <TonConnectButton />;
  return (
    <>
      <HStack>
        <Button size="sm" onClick={dep.onOpen} isDisabled={!treasury}>{t('general.deposit')}</Button>
        <Button size="sm" variant="outline" onClick={wdr.onOpen} isDisabled={!treasury}>{t('general.withdraw')}</Button>
      </HStack>
      <AmountModal isOpen={dep.isOpen} onClose={dep.onClose} title={t('general.deposit')} onConfirm={(amt) => { dep.onClose(); if (treasury) send(amt, treasury); }} />
      <AmountModal isOpen={wdr.isOpen} onClose={wdr.onClose} title={t('general.withdraw')} onConfirm={(amt) => { wdr.onClose(); if (treasury) send(amt, treasury); }} />
    </>
  );
}
