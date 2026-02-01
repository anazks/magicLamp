import Axios from '../Axios/Axios'

export const addEmail = async (emailData: any) => {
    try {
        const response = await Axios.post('/home/admin-emails/', emailData)
        console.log('Email added response:', response)
        return response.data
    } catch (error) {
        console.error('Error adding email:', error)
        throw error
    }
}

export const getAllEmails = async () => {
    try {
        const response = await Axios.get('/home/admin-emails/')
        console.log('Fetched emails:', response)
        return response
    } catch (error) {
        console.error('Error fetching emails:', error)
        throw error
    }
}
export const deleteEmail = async (emailId: number) => {
    try {
        const response = await Axios.delete(`/home/admin-emails/${emailId}/`)
        console.log('Email deleted response:', response)
        return response
    } catch (error) {
        console.error('Error deleting email:', error)
        throw error
    }
}