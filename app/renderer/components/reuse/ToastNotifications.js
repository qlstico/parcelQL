import { toast } from 'react-toastify';

// Toast notifications for UX and passing on error messages from backend

export const notifyRemoved = (parent, deletedItem) =>
  toast(`✌️✌️Removed "${deletedItem}" from ${parent}!`, {
    position: 'top-center',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  });

export const notifyAdded = (parent, addedItem) =>
  toast.success(`👌👌Added "${addedItem}" to ${parent}!`, {
    position: 'top-center',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  });

export const notifyError = errorMessage =>
  toast.error(
    `👎👎Oh no! Looks like something went wrong!  
     >>>ERROR : ${errorMessage} <<<`,
    {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    }
  );
