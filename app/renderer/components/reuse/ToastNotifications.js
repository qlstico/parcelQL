import { toast } from 'react-toastify';
export const notifyRemoved = (parent, deletedItem) =>
  toast(`✌️✌️Removed "${deletedItem}" from ${parent}!`, {
    position: 'top-center',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });

export const notifyAdded = (parent, addedItem) =>
  toast.success(`🦄🦄 Added "${addedItem}" to ${parent}!`, {
    position: 'top-center',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });

export const notifyError = errorMessage =>
  toast.error(
    `😭😭Oh no! We've encountered the following error: "${errorMessage}"`,
    {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    }
  );
