import axios from 'axios';
import { showAlert } from './alert';
export const updateSettings = async (data , type ) => {
   try {
    const url = type === 'password' 
    ? 'https://localhost:3000/api/v1/users/updateMyPassword' 
    : 'https://localhost:3000/api/v1/users/updateMe';
         // console.log(name , email);
         const res = await axios({
           method: 'PATCH',
           url ,
           data: {
             data
           }
         });
            if (res.data.status === 'success') {
                showAlert('success', `${type.toUpperCase()} updated successfully!`);
                window.setTimeout(() => {
                    location.assign('/me');
                }, 1500);
            }
       } catch (err) {
         showAlert('error', err.response.data.message);
       }
}