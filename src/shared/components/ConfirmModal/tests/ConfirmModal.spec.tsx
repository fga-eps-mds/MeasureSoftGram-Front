import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmModal from '../ConfirmModal';
import '@testing-library/jest-dom';
import { useTranslation } from 'react-i18next';

describe('ConfirmModal Component', () => {
  const mockSetIsModalOpen = jest.fn();
  const mockHandleConfirmBtnClick = jest.fn();
  const mockHandleDismissBtnClick = jest.fn();

  const defaultProps = {
    text: 'Are you sure you want to proceed?',
    btnConfirmText: 'Confirm',
    btnDismissText: 'Cancel',
    isModalOpen: true,
    setIsModalOpen: mockSetIsModalOpen,
    handleConfirmBtnClick: mockHandleConfirmBtnClick,
    handleDismissBtnClick: mockHandleDismissBtnClick,
  };

  it('should render the modal when isModalOpen is true', () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
  });

  it('should not render the modal when isModalOpen is false', () => {
    render(<ConfirmModal {...defaultProps} isModalOpen={false} />);
    expect(screen.queryByText('Are you sure you want to proceed?')).not.toBeInTheDocument();
  });

  it('should call handleConfirmBtnClick when the confirm button is clicked', () => {
    render(<ConfirmModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Confirm'));
    expect(mockHandleConfirmBtnClick).toHaveBeenCalled();
  });

  it('should call handleDismissBtnClick when the dismiss button is clicked', () => {
    render(<ConfirmModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockHandleDismissBtnClick).toHaveBeenCalled();
  });
});
