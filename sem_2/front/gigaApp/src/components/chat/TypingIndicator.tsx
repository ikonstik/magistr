// components/chat/TypingIndicator.tsx
import React from 'react'
import styles from './TypingIndicator.module.css'

export const TypingIndicator: React.FC = () => {
	return (
		<div className={styles.typing}>
			<span className={styles.dot}>.</span>
			<span className={styles.dot}>.</span>
			<span className={styles.dot}>.</span>
			<span className={styles.text}>GigaChat печатает</span>
		</div>
	)
}
