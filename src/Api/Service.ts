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