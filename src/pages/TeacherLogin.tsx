import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, GraduationCap, LogIn } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const TeacherLogin = () => {
	const navigate = useNavigate()
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')

	const loginMutation = useMutation({
		mutationFn: async (creadentials: {
			username: string
			password: string
		}) => {
			return apiClient.teacherLogin(creadentials)
		},
		onSuccess: data => {
			// Сохраняем учителя и токен в sessionStorage
			sessionStorage.setItem('teacher', JSON.stringify(data.teacher))
			if (data.token) {
				sessionStorage.setItem('teacher_token', data.token)
			}

			toast.success('Добро пожаловать!', {
				description: `Вы вошли как ${data.teacher.full_name}`,
			})

			// Перенаправляем в зависимости от роли
			if (data.teacher.role === 'admin') {
				navigate('/admin/dashboard') // Админ идет в админ-панель
			} else {
				navigate('/teacher/dashboard') // Обычный учитель в свой дашборд
			}
		},
		onError: (error: Error) => {
			console.error('Login error:', error)
			toast.error('Ошибка входа', {
				description: 'Неверное имя пользователя или пароль',
			})
		},
	})

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!username.trim() || !password.trim()) {
			toast.error('Заполните все поля', {
				description: 'Введите имя пользователя и пароль',
			})
			return
		}

		loginMutation.mutate({ username, password })
	}

	return (
		<div className='min-h-screen bg-gradient-to-b from-background via-muted/30 to-background'>
			<div className='container mx-auto px-4 py-12'>
				<Button variant='ghost' onClick={() => navigate('/')} className='mb-6'>
					<ArrowLeft className='w-4 h-4 mr-2' />
					На главную
				</Button>

				<div className='max-w-md mx-auto'>
					<Card className='p-8 shadow-glow'>
						<div className='text-center mb-8'>
							<div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary mb-4'>
								<GraduationCap className='w-8 h-8 text-primary-foreground' />
							</div>
							<h1 className='text-3xl font-bold mb-2'>Вход для Учителя</h1>
							<p className='text-muted-foreground'>
								Получите доступ к вашим сообщениям
							</p>
						</div>

						<form onSubmit={handleLogin} className='space-y-6'>
							<div>
								<label
									htmlFor='username'
									className='block text-sm font-medium mb-2'
								>
									Имя пользователя
								</label>
								<Input
									id='username'
									type='text'
									placeholder='Введите имя пользователя'
									value={username}
									onChange={e => setUsername(e.target.value)}
									required
								/>
							</div>

							<div>
								<label
									htmlFor='password'
									className='block text-sm font-medium mb-2'
								>
									Пароль
								</label>
								<Input
									id='password'
									type='password'
									placeholder='Введите пароль'
									value={password}
									onChange={e => setPassword(e.target.value)}
									required
								/>
							</div>

							<Button
								type='submit'
								size='lg'
								className='w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity'
								disabled={loginMutation.isPending}
							>
								{loginMutation.isPending ? (
									'Вход...'
								) : (
									<>
										<LogIn className='w-4 h-4 mr-2' />
										Войти
									</>
								)}
							</Button>
						</form>
					</Card>
				</div>
			</div>
		</div>
	)
}

export default TeacherLogin
