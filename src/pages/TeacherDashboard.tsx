import {Button} from '@/components/ui/button'
import {Card} from '@/components/ui/card'
import {Skeleton} from '@/components/ui/skeleton'
import {apiClient, Teacher} from '@/lib/api'
import {useQuery} from '@tanstack/react-query'
import {ChevronDown, ChevronUp, EyeOff, GraduationCap, Heart, LogOut, User} from 'lucide-react'
import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {toast} from 'sonner'

const TeacherDashboard = () => {
    const navigate = useNavigate()
    const [teacher, setTeacher] = useState<Teacher | null>(null)
    const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set())

    // Проверяем авторизацию при загрузке
    useEffect(() => {
        const storedTeacher = sessionStorage.getItem('teacher')
        if (!storedTeacher) {
            navigate('/teacher/login')
            return
        }
        const parsedTeacher = JSON.parse(storedTeacher)

        // Проверяем роль и перенаправляем
        if (parsedTeacher.role === 'admin') {
            toast.info('Вы администратор, перенаправляем в админ-панель')
            navigate('/admin/dashboard')
            return
        }
        setTeacher(JSON.parse(storedTeacher))
    }, [navigate])

    // Загружаем сообщения
    const {
        data: messages,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['praise-messages', teacher?.id],
        queryFn: async () => {
            if (!teacher?.id) return []
            return apiClient.getTeacherPraise(teacher.id)
        },
        enabled: !!teacher?.id,
    })

    // Обработка ошибки загрузки сообщений
    useEffect(() => {
        if (error) {
            console.error('Error loading messages:', error)
            toast.error('Ошибка загрузки', {
                description: 'Не удалось загрузить сообщения',
            })
        }
    }, [error])

    const handleLogout = () => {
        sessionStorage.removeItem('teacher')
        sessionStorage.removeItem('teacher_token')
        toast.success('Вы вышли из системы')
        navigate('/')
    }

    const toggleMessageExpanded = (messageId: string) => {
        setExpandedMessages(prev => {
            const newSet = new Set(prev)
            if (newSet.has(messageId)) {
                newSet.delete(messageId)
            } else {
                newSet.add(messageId)
            }
            return newSet
        })
    }

    // Если учитель не загружен, показываем ничего (произойдет redirect)
    if (!teacher) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <Skeleton className='h-8 w-32'/>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-gradient-to-b from-background via-muted/30 to-background'>
            <div className='container mx-auto px-4 py-12'>
                {/* Header */}
                <div className='flex items-center justify-between mb-8'>
                    <div className='flex items-center space-x-4'>
                        <div
                            className='w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center'>
                            <GraduationCap className='w-8 h-8 text-primary-foreground'/>
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold'>{teacher.full_name}</h1>
                            <p className='text-muted-foreground'>{teacher.subject}</p>
                        </div>
                    </div>
                    <Button variant='outline' onClick={handleLogout}>
                        <LogOut className='w-4 h-4 mr-2'/>
                        Выйти
                    </Button>
                </div>

                {/* Stats */}
                <Card className='p-6 mb-8 bg-gradient-to-br from-accent/10 to-accent/5'>
                    <div className='flex items-center space-x-3'>
                        <Heart className='w-8 h-8 text-accent-foreground'/>
                        <div>
                            <p className='text-2xl font-bold'>{messages?.length || 0}</p>
                            <p className='text-muted-foreground'>Получено сообщений</p>
                        </div>
                    </div>
                </Card>

                {/* Messages */}
                <div className='space-y-4'>
                    <h2 className='text-2xl font-bold mb-4'>Ваши сообщения</h2>

                    {isLoading ? (
                        Array.from({length: 3}).map((_, i) => (
                            <Card key={i} className='p-6'>
                                <Skeleton className='h-4 w-1/4 mb-4'/>
                                <Skeleton className='h-20 w-full'/>
                            </Card>
                        ))
                    ) : messages?.length === 0 ? (
                        <Card className='p-12 text-center'>
                            <Heart className='w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50'/>
                            <h3 className='text-xl font-semibold mb-2'>Пока сообщений нет</h3>
                            <p className='text-muted-foreground'>
                                Когда ученики отправят вам сообщения, они появятся здесь
                            </p>
                        </Card>
                    ) : (
                        messages?.map(message => {
                            const isExpanded = expandedMessages.has(message.id)
                            const maxLength = 300 // Максимальная длина перед обрезкой
                            const shouldTruncate = message.message.length > maxLength && !isExpanded
                            const messageText = shouldTruncate
                                ? message.message.substring(0, maxLength) + '...'
                                : message.message

                            return (
                                <Card
                                    key={message.id}
                                    className='p-6 hover:shadow-soft transition-all'
                                >
                                    <div className='flex items-start space-x-3 mb-3'>
                                        <Heart className='w-5 h-5 text-accent-foreground flex-shrink-0 mt-1'/>
                                        <div className='flex-1'>
                                            {/* Информация об авторе и дате */}
                                            <div className='flex justify-between items-start mb-2'>
                                                <div className='flex items-center space-x-2'>
                                                    {message.is_anonymous ? (
                                                        <>
                                                            <EyeOff className='w-4 h-4 text-muted-foreground'/>
                                                            <span className='text-sm text-muted-foreground'>
																Анонимно
															</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <User className='w-4 h-4 text-muted-foreground'/>
                                                            <span className='text-sm font-medium text-foreground'>
																{message.user_name || 'Ученик'}
															</span>
                                                        </>
                                                    )}
                                                </div>
                                                <p className='text-sm text-muted-foreground'>
                                                    {new Date(message.created_at).toLocaleDateString(
                                                        'ru-RU',
                                                        {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        },
                                                    )}
                                                </p>
                                            </div>

                                            {/* Текст сообщения */}
                                            <div className='mb-3'>
                                                <p className='text-foreground leading-relaxed whitespace-pre-wrap'>
                                                    {messageText}
                                                </p>
                                                {message.message.length > maxLength && (
                                                    <Button
                                                        variant='link'
                                                        size='sm'
                                                        onClick={() => toggleMessageExpanded(message.id)}
                                                        className='p-0 h-auto text-xs text-muted-foreground'
                                                    >
                                                        {isExpanded ? (
                                                            <>
                                                                <ChevronUp className='w-3 h-3 mr-1'/>
                                                                Свернуть
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ChevronDown className='w-3 h-3 mr-1'/>
                                                                Прочитать полностью
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}

export default TeacherDashboard