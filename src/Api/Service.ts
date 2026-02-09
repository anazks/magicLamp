import Axios from '../Axios/Axios'

export const listServices = async () => {
    try {
        const response = await Axios.get('/services/categories/')
        return response.data
    } catch (error) {
        console.error('Error fetching services:', error)
        throw error
    }
}

export const serviceHistory = async () => {
    try {
        const response = await Axios.get(`/services/request/`)
        return response.data
    } catch (error) {
        console.error('Error fetching service history:', error)
        throw error
    }
}

export const ServiceSubCategory = async (serviceData: FormData) => {
    try {
        const response = await Axios.post('/services/admin/subcategories/create/', serviceData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return response.data
    } catch (error) {
        console.error('Error adding service:', error)
        throw error
    }
}
export const ServiceCategory = async (categoryData: any) => {
    try {
        const response = await Axios.post('/services/admin/categories/create/', categoryData)
        console.log('Category created response:', response)
        return response.data
    } catch (error) {
        console.error('Error adding category:', error)
        throw error
    }
}

export const getAllServiceCategory = async () => {
    try {
        const response = await Axios.get('/services/categories/')
        console.log('Fetched service categories:', response)
        return response
    } catch (error) {
        console.error('Error fetching service categories:', error)
        throw error
    }
}

export const deleteCategory = async (categoryId: number) => {
        try {
            const response = await Axios.delete(`/services/admin/categories/${categoryId}/`)
            console.log('Category deleted response:', response)
            return response
        } catch (error) {
            console.error('Error deleting category:', error)
            throw error
        }
}

export const getAllRequestedServices = async (url:any) => {
    try {
        if(url){
            console.log('Fetching requested services with URL:', url)
            const response = await Axios.get(url)
            console.log('Fetched requested services with URL:', response)
            return response
        }else{
            const response = await Axios.get('services/admin/requests/')
            console.log('Fetched requested services++++++++++++++:', response)
            return response 
        }
       
    } catch (error) {
        console.error('Error fetching requested services:', error)
        throw error
    }
}

export const makeRequest = async (requestData: any) => {
    try {
        console.log('Making booking request...')
        console.log('Request data type:', requestData.constructor.name)
        
        // Log FormData contents for debugging
        if (requestData instanceof FormData) {
            console.log('=== FormData Debug START ===');
            
            let hasFiles = false;
            let fileCount = 0;
            let textFieldCount = 0;
            
            // Create arrays to organize the output
            const textFields: any[] = [];
            const imageFiles: any[] = [];
            const audioFiles: any[] = [];
            const otherFiles: any[] = [];
            
            // Iterate through all FormData entries
            for (let [key, value] of requestData.entries()) {
                if (value instanceof File) {
                    hasFiles = true;
                    fileCount++;
                    
                    const fileInfo = {
                        key: key,
                        name: value.name,
                        type: value.type,
                        size: `${(value.size / 1024).toFixed(2)} KB`,
                        sizeBytes: value.size,
                        lastModified: new Date(value.lastModified).toLocaleString()
                    };
                    
                    // Categorize files
                    if (key === 'images' || value.type.startsWith('image/')) {
                        imageFiles.push(fileInfo);
                    } else if (key === 'audio' || value.type.startsWith('audio/')) {
                        audioFiles.push(fileInfo);
                    } else {
                        otherFiles.push(fileInfo);
                    }
                    
                    console.log(`📎 FILE [${key}]:`, fileInfo);
                } else {
                    textFieldCount++;
                    textFields.push({ key, value });
                    console.log(`📝 TEXT [${key}]:`, value);
                }
            }
            
            console.log('\n--- Summary ---');
            console.log('Total text fields:', textFieldCount);
            console.log('Total files:', fileCount);
            console.log('Has files:', hasFiles);
            
            if (textFields.length > 0) {
                console.log('\n📋 Text Fields:', textFields);
            }
            
            if (imageFiles.length > 0) {
                console.log('\n🖼️ Images (' + imageFiles.length + '):', imageFiles);
            }
            
            if (audioFiles.length > 0) {
                console.log('\n🎤 Audio Files (' + audioFiles.length + '):', audioFiles);
            }
            
            if (otherFiles.length > 0) {
                console.log('\n📦 Other Files (' + otherFiles.length + '):', otherFiles);
            }
            
            // Show complete FormData as a structured object
            const formDataObject: any = {};
            for (let [key, value] of requestData.entries()) {
                if (value instanceof File) {
                    if (!formDataObject[key]) {
                        formDataObject[key] = [];
                    }
                    formDataObject[key].push({
                        fileName: value.name,
                        fileType: value.type,
                        fileSize: value.size
                    });
                } else {
                    if (!formDataObject[key]) {
                        formDataObject[key] = value;
                    } else {
                        // Handle multiple values for same key
                        if (!Array.isArray(formDataObject[key])) {
                            formDataObject[key] = [formDataObject[key]];
                        }
                        formDataObject[key].push(value);
                    }
                }
            }
            
            console.log('\n📊 Complete FormData Structure:', JSON.stringify(formDataObject, null, 2));
            console.log('=== FormData Debug END ===\n');
        } else {
            // If it's not FormData, show what it is
            console.log('⚠️ Request data is NOT FormData');
            console.log('Data:', requestData);
        }
        
        console.log('📤 Sending POST request to /services/request/...');
        
        // Let Axios handle Content-Type automatically for FormData
        const response = await Axios.post('/services/request/', requestData)
        
        console.log('✅ Booking response received');
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        
        return response.data
    } catch (error: any) {
        console.error('❌ Error making booking request:', error)
        
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error status:', error.response.status);
            console.error('Error data:', error.response.data);
            console.error('Error headers:', error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error message:', error.message);
        }
        console.error('Error config:', error.config);
        
        throw error
    }
}


// 📊 Complete FormData Structure: {
//   "mobile_number": "9496343734",
//   "customer_name": "anaz",
//   "category": "10",
//   "service_details": "{\"description\":\"test audio\"}",
//   "address": "ByteBoot Techno solutions pvt ltd",
//   "latitude": "9.96733683517974",
//   "longitude": "76.29975136555625",
//   "images": [
//     {
//       "fileName": "photo.jpg",
//       "fileType": "image/jpeg",
//       "fileSize": 251584
//     }
//   ],
//   "audio": [
//     {
//       "fileName": "voice_recording_1738945680123.webm",
//       "fileType": "audio/webm",
//       "fileSize": 89548
//     }
//   ]
// }
export const updateRequestStatus = async (requestId: number, statusData: any) => {
    try {
        console.log('Updating request status with data:--------', statusData)
        let data = {
            status: statusData.status,
            admin_notes:statusData.admin_notes
        }
        // statusData.admin_notes = "Updated by admin"
        const response = await Axios.patch(`/services/admin/requests/${requestId}/`, data)
        console.log('Request status update response:', response)
        return response.data
    } catch (error) {
        console.error('Error updating request status:', error)
        throw error
    }
}
export const updateCategory = async (categoryId: number, categoryData: any) => {
    try {
        const response = await Axios.patch(`/services/admin/categories/${categoryId}/`, categoryData)
        console.log('Category update response:', response)
        return response.data
    } catch (error) {
        console.error('Error updating category:', error)
        throw error
    }
}

export const updateSubCategory = async (subCategoryId: number, subCategoryData: any) => {
    try {
        const response = await Axios.patch(`/services/admin/subcategories/${subCategoryId}/`, subCategoryData)
        console.log('Sub-category update response:', response)
        return response.data
    } catch (error) {
        console.error('Error updating sub-category:', error)
        throw error
    }
}
export const deleteSubCategory = async (subCategoryId: number) => {
    try {
        const response = await Axios.delete(`/services/admin/subcategories/${subCategoryId}/`)
        console.log('Sub-category deleted response:', response)
        return response
    } catch (error) {
        console.error('Error deleting sub-category:', error)
        throw error
    }
}

export const DashboardStats = async () => {
    try {
        const response = await Axios.get('services/admin/dashboard-analytics/')
        console.log('Fetched dashboard stats:', response)
        return response.data
    } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        throw error
    }
}