import { apiFetch } from './api';

export const loginApi = async (data: any) => {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const registerApi = async (data: any) => {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
