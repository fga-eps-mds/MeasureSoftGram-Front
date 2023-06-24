import { useState } from 'react';

export default function useDynamicBalance() {
  const [allowDynamicBalance, setAllowDynamicBalance] = useState(false);
  const [open, setOpen] = useState(false);

  function handleChange() {
    if (allowDynamicBalance) {
      setAllowDynamicBalance(false);
    } else {
      setOpen(true);
    }
  }

  function handleClose(): void {
    setOpen(false);
  }

  function handleConfirm(): void {
    setOpen(false);
    setAllowDynamicBalance(true);
  }

  return { handleChange, handleClose, handleConfirm, open, allowDynamicBalance };
}
