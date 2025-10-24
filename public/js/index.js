import '@babel/polyfill';
import { login } from './login.js';
import { logout } from './login.js';
import { displayMap } from './Mapbox.js';
import { updateSettings } from './updateSettings.js';
import { now } from 'mongoose';
import { bookTour } from './stripe.js';

const mapBox = document.getElementById('map');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginForm = document.querySelector('.form--login');
    const logoutBtn = document.querySelector('.nav__el--logout');
    const updateUserForm = document.querySelector('.form-user-data');
    const updatePasswordForm = document.querySelector('.form-user-password');
    const bookBtn = document.getElementById('book-tour');
if(mapBox){
const locations = JSON.parse(document.getElementById('map').dataset.locations);
const startLocation = JSON.parse(document.getElementById('map').dataset.startLocation);
displayMap(locations);
} 
if(loginForm){
document.querySelector('.form').addEventListener('submit', e => {
    e.preventDefault();

    console.log(email, password);
    login(email, password);
});
}
if(logoutBtn) logoutBtn.addEventListener('click', logout);
if(updateUserForm){
    updateUserForm.addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData() ; 
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        
    
        
        updateSettings( form, 'data');
    });
}
if(updatePasswordForm){
    updatePasswordForm.addEventListener('submit', async e => {
        e.preventDefault();
        
        document.querySelector('.btn--save-password').textContent = 'Updating...';
        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updateSettings({ passwordCurrent, password, passwordConfirm }, 'password');
        document.querySelector('.btn--save-password').textContent = 'Save password';
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    });
}

if(bookBtn){
    bookBtn.addEventListener('click', e => {
        e.target.textContent = 'Processing...';
        const tourId = e.target.dataset.tourId;
        console.log(tourId);
        bookTour(tourId);
    });
}