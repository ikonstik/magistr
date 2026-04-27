import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
	name: 'ui',
	initialState: {
		snackbar: {
			open: false,
			message: '',
			severity: 'success',
		},
		modalOpen: false,
	},
	reducers: {
		showSnackbar: (state, action) => {
			state.snackbar = {
				open: true,
				message: action.payload.message,
				severity: action.payload.severity || 'success',
			}
		},
		hideSnackbar: state => {
			state.snackbar.open = false
		},
		openModal: state => {
			state.modalOpen = true
		},
		closeModal: state => {
			state.modalOpen = false
		},
	},
})

export const { showSnackbar, hideSnackbar, openModal, closeModal } =
	uiSlice.actions
export default uiSlice.reducer
