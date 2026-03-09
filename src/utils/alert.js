import Swal from "sweetalert2";

// القاعدة المشتركة لجميع Toasts
const baseToast = {
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 1800,
  timerProgressBar: true,
  padding: "0.4rem 0.6rem",
  customClass: { popup: "swal-toast-compact" },
  showClass: { popup: "animate__animated animate__fadeInDown" },
  hideClass: { popup: "animate__animated animate__fadeOutUp" },
};

// ====== Success Alert ======
export const successAlert = (title) => {
  return Swal.fire({
    ...baseToast,
    icon: "success",
    title,
    customClass: { popup: "swal-toast-compact swal-toast-success" },
  });
};

// ====== Error Alert ======
export const errorAlert = (title) => {
  return Swal.fire({
    ...baseToast,
    icon: "error",
    title,
    customClass: { popup: "swal-toast-compact swal-toast-error" },
  });
};

// ====== Warning Alert ======
export const warningAlert = (title) => {
  return Swal.fire({
    ...baseToast,
    icon: "warning",
    title,
    customClass: { popup: "swal-toast-compact swal-toast-warning" },
  });
};

// ====== Confirm Alert ======
export const confirmAlert = async (title) => {
  const result = await Swal.fire({
    toast: false,
    icon: "question",
    title,
    showCancelButton: true,
    confirmButtonText: "نعم",
    cancelButtonText: "إلغاء",
    customClass: {
      popup: "swal-toast-compact swal-toast-info",
      confirmButton: "swal2-confirm",
      cancelButton: "swal2-cancel",
    },
    showClass: { popup: "animate__animated animate__fadeInDown" },
    hideClass: { popup: "animate__animated animate__fadeOutUp" },
  });
  return result.isConfirmed;
};
