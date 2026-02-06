
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
    const response = await Axios.patch(
      '/home/profile/update/',
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          // If you use JWT / Bearer token:
          // 'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
        },
      }
    );

    console.log('Profile update success:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Profile update failed:', error.response?.data || error.message);
    if (error.response?.status === 415) {
      console.error('415 Unsupported Media Type → Content-Type was missing or incorrect');
    }
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