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

export const getAllRequestedServices = async () => {
    try {
        const response = await Axios.get('services/admin/requests/')
        console.log('Fetched requested services:', response)
        return response 
    } catch (error) {
        console.error('Error fetching requested services:', error)
        throw error
    }
}

export const makeRequest = async (requestData: any) => {
    try {
        const response = await Axios.post('/services/request/', requestData)
        console.log('Service request response:', response)
        return response.data
    } catch (error) {
        console.error('Error making service request:', error)
        throw error
    }
}

export const updateRequestStatus = async (requestId: number, statusData: any) => {
    try {
        console.log('Updating request status with data:--------', statusData)
        let data = {
            status: statusData,
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
// export const updateStatus = async (requestId: number, statusData: any) => {
//     try {
//         const response = await Axios.patch(`/services/admin/requests/${requestId}/`, statusData)
//         console.log('User request status update response:', response)
//         return response.data
//     } catch (error) {
//         console.error('Error updating user request status:', error)
//         throw error
//     }
// }