import React from 'react'
import {
	Timeline,
	TimelineItem,
	TimelineSeparator,
	TimelineConnector,
	TimelineContent,
	TimelineDot,
	TimelineOppositeContent,
} from '@mui/lab'
import { Typography, Box, Chip, Paper } from '@mui/material'
import {
	CheckCircle,
	LocalShipping,
	Inventory,
	Payment,
	Cancel,
	AccessTime,
} from '@mui/icons-material'

const statusIcons = {
	создан: <AccessTime />,
	оплачен: <Payment />,
	'на сборке': <Inventory />,
	собран: <Inventory />,
	'передан в доставку': <LocalShipping />,
	доставляется: <LocalShipping />,
	доставлен: <CheckCircle />,
	отменен: <Cancel />,
}

const getStatusColor = status => {
	if (status === 'доставлен') return 'success'
	if (status === 'отменен') return 'error'
	if (status.includes('доставк')) return 'warning'
	return 'info'
}

const formatDate = dateString => {
	if (!dateString) return 'Дата неизвестна'

	try {
		const date = new Date(dateString)
		// Проверяем, корректная ли дата
		if (isNaN(date.getTime())) {
			return 'Дата неизвестна'
		}
		return date.toLocaleString('ru-RU', {
			day: '2-digit',
			month: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		})
	} catch (error) {
		return 'Дата неизвестна'
	}
}
const OrderStatusTimeline = ({ history }) => {
	if (!history || history.length === 0) {
		return null
	}

	return (
		<Paper sx={{ p: 3 }}>
			<Typography variant='h6' gutterBottom>
				История перемещений
			</Typography>

			<Timeline position='right'>
				{history.map((event, index) => (
					<TimelineItem key={index}>
						<TimelineOppositeContent
							sx={{ m: 'auto 0' }}
							variant='body2'
							color='text.secondary'
						>
							{formatDate(event.changed_at)}
						</TimelineOppositeContent>
						<TimelineSeparator>
							<TimelineDot color={getStatusColor(event.status)}>
								{statusIcons[event.status] || <AccessTime />}
							</TimelineDot>
							{index < history.length - 1 && <TimelineConnector />}
						</TimelineSeparator>
						<TimelineContent sx={{ py: '12px', px: 2 }}>
							<Typography variant='subtitle2' component='span'>
								{event.status.charAt(0).toUpperCase()  + event.status.slice(1)}
							</Typography>
							{event.location && (
								<Typography
									variant='caption'
									display='block'
									color='text.secondary'
								>
									{' ' + event.location}
								</Typography>
							)}
							{event.description && (
								<Typography
									variant='body2'
									color='text.secondary'
									sx={{ mt: 0.5 }}
								>
									{event.description}
								</Typography>
							)}
						</TimelineContent>
					</TimelineItem>
				))}
			</Timeline>
		</Paper>
	)
}

export default OrderStatusTimeline
