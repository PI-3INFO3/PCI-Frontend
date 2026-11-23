import apiClient from "./config";

export function register(data) {
  return apiClient.post('/registro/', data);
  }

export function login(email, password) {
  return apiClient.post('/token/', {
    email,
    password,
  })
  }

export function me() {
  return apiClient.get('/usuarios/me/');
  }

export function updateMe(data) {
  return apiClient.patch('/usuarios/me/', data);
  }

export function changePassword(currentPassword, newPassword) {
  return apiClient.post('/usuarios/change_password/', {
    current_password: currentPassword,
    new_password: newPassword,
  });
  }

export function uploadImage(file, description = '') {
  const formData = new FormData()

  formData.append('file', file)
  if (description) {
    formData.append('description', description)
  }

  return apiClient.post('/media/images/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  }

export function verifyEmail(email, codigo) {
  return apiClient.post('/verificar-email/', { email, codigo });
  }

export function resendVerificationCode(email) {
  return apiClient.post('/reenviar-codigo/', { email });
  }

const authApi = {
  register,
  login,
  me,
  updateMe,
  changePassword,
  uploadImage,
  verifyEmail,
  resendVerificationCode,
};

export default authApi;