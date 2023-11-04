import { browser } from '$app/environment';
import { writable } from 'svelte/store';

let storeValues = {
    sub: null,
    dark: false,
    intro: true,
    loginModal: false,
    signupModal: false,
    addPostModal: false,
};
if (browser) {
    storeValues = JSON.parse(localStorage.getItem('place4pals')) || storeValues;
}
export const store = writable(storeValues);

if (browser) {
    store.subscribe((value) =>
        localStorage.setItem('place4pals', JSON.stringify(value))
    );
}