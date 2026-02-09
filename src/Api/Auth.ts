
import Axios from '../Axios/Axios'


export const userRegistration = async (data: any) => {
    try {
        console.log("Registering user with data---------------------+++:", data);
        const response = await Axios.post('/home/user_registration/', data);
        console.log("User registration response---------------------:", response);
        return response.data;
    } catch (error) {
        throw error;
    }
}
export const generateOTP = async (data: any) => {
    try {
        console.log("Generating OTP with data---------------------+++:", data);
        const response = await Axios.post('/home/generate_otp/', data);
        console.log("OTP generation response---------------------:", response);
        return response;
    } catch (error: any) {
        console.log("Error in generating OTP---------------------+++:", error);
        throw error;
    }
}
export const otpVerificationRegister = async (data: any) => {
    try {
        console.log("Verifying OTP with data---------------------+++:", data);
        const response = await Axios.post('home/register/verify-otp/', data);
        return response.data;
    } catch (error) {
        throw error;
    }
}
export const otpVerificationLogin = async (data: any) => {
    try {
        console.log("Verifying Login otp++++++++++++++++++++++:", data);
        const response = await Axios.post('/home/verify_otp_and_login/', data);
        return response.data;
    } catch (error) {
        throw error;
    }
}
export const createNewPassword = async (data: any) => {
    try {
        const response = await Axios.post('/auth/create-new-password/', data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const profileDetails = async () => {
    try {
        const response = await Axios.get('/home/profile/update/');
        console.log(response,"response...")
        return response.data;
    } catch (error) {
        throw error;
    }
}





export const updateProfile = async (data: any) => {
  try {
    const formData = new FormData();

    // Only append fields that are provided
    if (data.first_name !== undefined) formData.append('first_name', data.first_name.trim());
    if (data.last_name !== undefined) formData.append('last_name', data.last_name.trim());
    if (data.phone_number !== undefined) formData.append('phone_number', data.phone_number.trim());
    if (data.date_of_birth !== undefined) formData.append('date_of_birth', data.date_of_birth);
    if (data.district !== undefined) formData.append('district', data.district.trim());
    if (data.state !== undefined) formData.append('state', data.state.trim());
    if (data.address !== undefined) formData.append('address', data.address.trim());
    if (data.pin_code !== undefined && data.pin_code !== null) {
      formData.append('pin_code', String(data.pin_code));
    }

    // If profile picture upload is added later:
    // if (data.profile_picture instanceof File) {
    //   formData.append('profile_picture', data.profile_picture);
    // }

    const response = await Axios.patch('/home/profile/update/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Profile update failed:', error.response?.data || error.message);
    throw error;
  }
};
export const googleAuth = async (data: any) => {
        try {
                let dataObj = {
                    token: data
                }
            console.log("google id",dataObj);
            const response = await Axios.post('/home/auth/google/', dataObj);
            console.log("Google auth response------------------",response);
            return response;
        } catch (error) {
            throw error;
        }
}

export const googleCallBack = async () => {
        try {
            const response = await Axios.get('/home/auth/google/callback/');
            return response.data;
        }
        catch (error) {
            throw error;
        }
}

export const getUsers = async () => {
    try {
        const response = await Axios.get('/home/admin/users/');   
        return response.data;
    } catch (error) {
        throw error;
    }
}
export const getUserDetails = async (userId: number | string) => {
    try {
        const response = await Axios.get(`/home/admin/user/${userId}/details/`);   
        return response.data;
    } catch (error) {
        throw error;
    }
}