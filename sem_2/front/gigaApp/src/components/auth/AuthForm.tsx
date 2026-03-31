import React from 'react'
import { Buffer } from 'buffer' // Добавьте импорт
import type { ChatScope } from '../../types'
import shared from '../../styles/shared.module.css'
import styles from './AuthForm.module.css'
import { ErrorMessage } from '../common/ErrorMessage'
import { useChatStore } from '../../store/chatStore'

export const AuthForm: React.FC = () => {
	const { login, state } = useChatStore()
	const [clientId, setClientId] = React.useState('')
	const [clientSecret, setClientSecret] = React.useState('')
	const [scope, setScope] = React.useState<ChatScope>('GIGACHAT_API_PERS')
	const [isLoading, setIsLoading] = React.useState(false)

	React.useEffect(() => {
		if (import.meta.env.DEV) {
			const devClientId = import.meta.env.VITE_GIGACHAT_CLIENT_ID
			const devClientSecret = import.meta.env.VITE_GIGACHAT_CLIENT_SECRET

			if (devClientId && devClientSecret) {
				setClientId(devClientId)
				setClientSecret(devClientSecret)
			}
		}
	}, [])

	const handleSubmit: React.FormEventHandler = async e => {
		e.preventDefault()

		if (!clientId.trim() || !clientSecret.trim()) {
			return
		}

		setIsLoading(true)

		try {
			// Используем Buffer для кодирования
			const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
				'base64'
			)
			console.log('Credentials created, length:', credentials.length)
			await login(credentials, scope)
		} catch (error) {
			console.error('Ошибка входа:', error)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className={styles.screen}>
			<form className={styles.form} onSubmit={handleSubmit}>
				<h1 className={styles.title}>Вход в GigaChat</h1>

				<label className={shared.field}>
					<span className={shared.fieldLabel}>Client ID</span>
					<input
						type='text'
						className={`${shared.input} ${styles.authInput}`}
						value={clientId}
						onChange={e => setClientId(e.target.value)}
						placeholder='Введите Client ID'
						disabled={isLoading}
						required
					/>
				</label>

				<label className={shared.field}>
					<span className={shared.fieldLabel}>Client Secret</span>
					<input
						type='password'
						className={`${shared.input} ${styles.authInput}`}
						value={clientSecret}
						onChange={e => setClientSecret(e.target.value)}
						placeholder='Введите Client Secret'
						disabled={isLoading}
						required
					/>
				</label>

				<fieldset className={`${shared.field} ${styles.scope}`}>
					<legend className={shared.fieldLabel}>Scope</legend>
					<label className={shared.radio}>
						<input
							type='radio'
							name='scope'
							value='GIGACHAT_API_PERS'
							checked={scope === 'GIGACHAT_API_PERS'}
							onChange={() => setScope('GIGACHAT_API_PERS')}
							disabled={isLoading}
						/>
						<span>GIGACHAT_API_PERS (Персональный)</span>
					</label>
					<label className={shared.radio}>
						<input
							type='radio'
							name='scope'
							value='GIGACHAT_API_CORP'
							checked={scope === 'GIGACHAT_API_CORP'}
							onChange={() => setScope('GIGACHAT_API_CORP')}
							disabled={isLoading}
						/>
						<span>GIGACHAT_API_CORP (Корпоративный)</span>
					</label>
				</fieldset>

				{state.error && <ErrorMessage message={state.error} />}

				<button
					type='submit'
					className={`${shared.btn} ${shared.btnPrimary} ${styles.submit}`}
					disabled={isLoading}
				>
					{isLoading ? 'Вход...' : 'Войти'}
				</button>
			</form>
		</div>
	)
}
