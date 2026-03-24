import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface MessageCellProps {
	message: string
	isExpanded: boolean
	onToggle: () => void
}

const MessageCell: React.FC<MessageCellProps> = ({
	message,
	isExpanded,
	onToggle,
}) => {
	const textRef = useRef<HTMLDivElement>(null)
	const [isOverflowing, setIsOverflowing] = useState(false)

	useEffect(() => {
		if (textRef.current) {
			// Проверяем, переполняется ли текст
			setIsOverflowing(
				textRef.current.scrollWidth > textRef.current.clientWidth,
			)
		}
	}, [message, isExpanded]) // Пересчитываем при изменении сообщения или состояния развёрнутости

	const displayText = isExpanded
		? message
		: message.length > 100
			? message.substring(0, 100) + '...'
			: message

	return (
		<div className='max-w-xs'>
			<div ref={textRef} className={isExpanded ? '' : 'truncate'}>
				{displayText}
			</div>
			{(isOverflowing || message.length > 100) && (
				<Button
					variant='link'
					size='sm'
					onClick={onToggle}
					className='p-0 h-auto text-xs text-muted-foreground'
				>
					{isExpanded ? (
						<>
							<ChevronUp className='w-3 h-3 mr-1' />
							Свернуть
						</>
					) : (
						<>
							<ChevronDown className='w-3 h-3 mr-1' />
							Прочитать полностью
						</>
					)}
				</Button>
			)}
		</div>
	)
}

export default MessageCell