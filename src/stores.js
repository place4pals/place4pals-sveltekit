import { writable } from 'svelte/store';
import { fromLocalStorage } from './scripts/fromLocalStorage';
import { toLocalStorage } from './scripts/toLocalStorage';

export const userStore = writable(null);
export const modalStore = writable({ loginModal: false, signupModal: false, addPostModal: false });
export const introStore = writable(fromLocalStorage('introStore', 1));
toLocalStorage(introStore, 'introStore');