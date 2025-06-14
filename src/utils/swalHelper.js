import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const showLoading = (message = 'Loading...') => {
  Swal.fire({
    title: message,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

const closeLoading = () => {
  Swal.close();
};

const showError = (message) => {
  return Swal.fire({
    icon: 'error',
    title: 'Oops...',
    text: message,
    confirmButtonColor: '#285e43',
  });
};

const showSuccess = (message) => {
  return Toast.fire({
    icon: 'success',
    title: message,
  });
};

const showConfirm = (message) => {
  return Swal.fire({
    title: 'Are you sure?',
    text: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#285e43',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes',
    cancelButtonText: 'No',
  });
};

export { showLoading, closeLoading, showError, showSuccess, showConfirm }; 