import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GraduationCap, Heart, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Index = () => {
	const navigate = useNavigate()

	return (
		<div className='min-h-screen bg-gradient-to-b from-background via-muted/30 to-background'>
			<div className='container mx-auto px-4 py-16 md:py-24'>
				{/* Hero Section */}
				<div className='text-center mb-16 animate-fade-in'>
					<div className='inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mb-6 shadow-glow'>
						<Heart className='w-10 h-10 text-primary-foreground' />
					</div>
					<h1 className='text-5xl md:text-6xl font-bold mb-5 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent'>
						Спасибо, Учитель!
					</h1>
					<p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
						Особое место, где можно анонимно (и не только) выразить
						признательность учителям, которые вдохновляют нас
					</p>
				</div>

				{/* Role Selection Cards */}
				<div className='grid md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
					{/* Student Card */}
					<Card
						className='p-8 hover:shadow-glow transition-all duration-300 border-2 hover:border-accent cursor-pointer group'
						onClick={() => navigate('/teachers')}
					>
						<div className='text-center space-y-6'>
							<div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 group-hover:bg-accent/30 transition-colors'>
								<Users className='w-8 h-8 text-accent-foreground' />
							</div>
							<div>
								<h2 className='text-2xl font-bold mb-2'>Я ученик</h2>
								<p className='text-muted-foreground mb-6'>
									Отправьте свои трогательные сообщения учителю
								</p>
							</div>
							<Button
								size='lg'
								className='w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold'
							>
								Написать сообщение
							</Button>
						</div>
					</Card>

					{/* Teacher Card */}
					<Card
						className='p-8 hover:shadow-glow transition-all duration-300 border-2 hover:border-primary cursor-pointer group'
						onClick={() => navigate('/teacher/login')}
					>
						<div className='text-center space-y-6'>
							<div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary group-hover:opacity-90 transition-opacity'>
								<GraduationCap className='w-8 h-8 text-primary-foreground' />
							</div>
							<div>
								<h2 className='text-2xl font-bold mb-2'>Я учитель</h2>
								<p className='text-muted-foreground mb-6'>
									Войдите в систему, чтобы прочитать трогательные сообщения от
									ваших учеников
								</p>
							</div>
							<Button
								size='lg'
								className='w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity'
							>
								Войти
							</Button>
						</div>
					</Card>
				</div>

				{/* Footer Note */}
				<div className='text-center mt-16 text-muted-foreground'>
					<p className='text-sm'>
						Сообщения могут быть анонимны. В таком случае учителя не могут
						видеть, кто написал сообщения.
					</p>
				</div>
			</div>
		</div>
	)
}

export default Index
