import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { apiClient } from '@/lib/api'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, EyeOff, Heart, Send, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

const PraiseForm = () => {
	const navigate = useNavigate()
	const { teacherId } = useParams<{ teacherId: string }>()
	const [message, setMessage] = useState('')
	const [isAnonymous, setIsAnonymous] = useState(true)
	const [userName, setUserName] = useState('')

	// Загружаем настройки из куки при монтировании
	useEffect(() => {
		const savedAnonymous = document.cookie
			.split('; ')
			.find(row => row.startsWith('praise_anonymous='))
			?.split('=')[1]

		const savedUserName = document.cookie
			.split('; ')
			.find(row => row.startsWith('praise_user_name='))
			?.split('=')[1]

		if (savedAnonymous !== undefined) {
			setIsAnonymous(savedAnonymous === 'true')
		}
		if (savedUserName) {
			setUserName(decodeURIComponent(savedUserName))
		}
	}, [])

	// Сохраняем настройки в куки при изменении
	useEffect(() => {
		const oneYear = 365 * 24 * 60 * 60 * 1000
		document.cookie = `praise_anonymous=${isAnonymous}; max-age=${oneYear}; path=/`
		if (userName.trim()) {
			document.cookie = `praise_user_name=${encodeURIComponent(
				userName.trim()
			)}; max-age=${oneYear}; path=/`
		}
	}, [isAnonymous, userName])

	const { data: teacher, isLoading } = useQuery({
		queryKey: ['teacher', teacherId],
		queryFn: () => apiClient.getTeacher(teacherId!),
		enabled: !!teacherId,
	})

	const submitPraise = useMutation({
		mutationFn: async (data: {
			message: string
			isAnonymous: boolean
			userName?: string
		}) => {
			await apiClient.sendPraise(
				teacherId!,
				data.message,
				data.isAnonymous,
				data.userName
			)
		},
		onSuccess: () => {
			toast.success('Ваше сообщение отправлено!', {
				description: 'Спасибо вам за то, что распространяете позитив!',
			})
			setTimeout(() => navigate('/teachers'), 2000)
		},
		onError: () => {
			toast.error('Не удалось отправить сообщение', {
				description: 'Попробуйте еще раз позже',
			})
		},
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (message.trim().length < 10) {
			toast.error('Пожалуйста, напишите сообщение длиннее', {
				description: 'Ваше сообщение должна содержать не менее 10 символов',
			})
			return
		}

		if (!isAnonymous && !userName.trim()) {
			toast.error('Пожалуйста, введите ваше имя', {
				description: 'Для отправки с подписью необходимо указать имя',
			})
			return
		}

		submitPraise.mutate({
			message: message.trim(),
			isAnonymous,
			userName: isAnonymous ? undefined : userName.trim(),
		})
	}

	if (isLoading) {
		return (
			<div className='min-h-screen bg-gradient-to-b from-background via-muted/30 to-background'>
				<div className='container mx-auto px-4 py-12 max-w-2xl'>
					<Card className='p-8'>
						<Skeleton className='h-8 w-3/4 mb-4' />
						<Skeleton className='h-4 w-1/2 mb-8' />
						<Skeleton className='h-48 w-full' />
					</Card>
				</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-gradient-to-b from-background via-muted/30 to-background'>
			<div className='container mx-auto px-4 py-12 max-w-2xl'>
				{/* Header */}
				<Button
					variant='ghost'
					onClick={() => navigate('/teachers')}
					className='mb-6'
				>
					<ArrowLeft className='w-4 h-4 mr-2' />
					Вернуться к учителям
				</Button>

				<Card className='p-8 shadow-glow'>
					<div className='text-center mb-8'>
						<div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-4'>
							<Heart className='w-8 h-8 text-accent-foreground' />
						</div>
						<h1 className='text-3xl font-bold mb-2'>
							Сообщение для {teacher?.full_name}
						</h1>
						<p className='text-muted-foreground'>{teacher?.subject}</p>
					</div>

					<form onSubmit={handleSubmit} className='space-y-6'>
						{/* Выбор типа отправки */}
						<div className='flex gap-4'>
							<Button
								type='button'
								variant={isAnonymous ? 'default' : 'outline'}
								onClick={() => setIsAnonymous(true)}
								className='flex-1'
							>
								<EyeOff className='w-4 h-4 mr-2' />
								Анонимно
							</Button>
							<Button
								type='button'
								variant={!isAnonymous ? 'default' : 'outline'}
								onClick={() => setIsAnonymous(false)}
								className='flex-1'
							>
								<User className='w-4 h-4 mr-2' />С подписью
							</Button>
						</div>

						{/* Поле для имени, если не анонимно */}
						{!isAnonymous && (
							<div>
								<label
									htmlFor='name'
									className='block text-sm font-medium mb-2'
								>
									Ваше имя
								</label>
								<input
									id='name'
									type='text'
									placeholder='Введите ваше имя'
									value={userName}
									onChange={e => setUserName(e.target.value)}
									className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent'
									maxLength={50}
								/>
								<p className='text-xs text-muted-foreground mt-2'>
									{userName.length}/50 символов
								</p>
							</div>
						)}

						{/* Поле для сообщения */}
						<div>
							<label
								htmlFor='message'
								className='block text-sm font-medium mb-2'
							>
								{isAnonymous ? 'Ваше анонимное сообщение' : 'Ваше сообщение'}
							</label>
							<Textarea
								id='message'
								placeholder='Расскажите, что делает этого преподавателя особенным... Как он повлиял на ваше обучение? Что вы в нем цените?'
								value={message}
								onChange={e => setMessage(e.target.value)}
								className='min-h-[200px] resize-none'
								maxLength={1000}
							/>
							<p className='text-xs text-muted-foreground mt-2'>
								{message.length}/1000 символов
							</p>
						</div>

						{/* Информационный блок */}
						<div className='bg-muted p-4 rounded-lg'>
							<p className='text-sm text-muted-foreground'>
								{isAnonymous ? (
									<>
										<strong>Ваше сообщение будет анонимным.</strong> Учитель не
										узнает, кто его написал. Пожалуйста, будьте добры и
										уважительны.
									</>
								) : (
									<>
										<strong>Ваше сообщение будет подписано.</strong> Учитель
										увидит ваше имя. Пожалуйста, будьте добры и уважительны.
									</>
								)}
							</p>
						</div>

						<Button
							type='submit'
							size='lg'
							className='w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold'
							disabled={submitPraise.isPending}
						>
							{submitPraise.isPending ? (
								'Отправляется...'
							) : (
								<>
									<Send className='w-4 h-4 mr-2' />
									Отправить сообщение
								</>
							)}
						</Button>
					</form>
				</Card>
			</div>
		</div>
	)
}

export default PraiseForm
